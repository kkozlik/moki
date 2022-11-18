   


export default function isLDAPIP(value) {
     /**
        * Return regexp matching host and optional port of an URL
        *
        * @return string
        */
     
    function hostports() {
        // hostport = host [ ":" port ]
        return host() + "(:" + port() + ")?";
    }


    /**
        * Return regexp matching host part of an URL
        *
        * @return string
        */
    function host() {

        let alpha = "[a-zA-Z]";
        let alphadigit = "[a-zA-Z0-9]";

        // domainlabel  = alphadigit | alphadigit *[ alphadigit | "-" ] alphadigit
        let domainlabel = `(${alphadigit}|(${alphadigit}(${alphadigit}|-)*${alphadigit}))`;

        // toplabel     = alpha | alpha *[ alphadigit | "-" ] alphadigit
        let toplabel = `(${alpha}|(${alpha}(${alphadigit}|-)*${alphadigit}))`

        // hostname     = *[ domainlabel "." ] toplabel
        let hostname = `(${domainlabel}\\.)*${toplabel}`;

        let hex4 = "([0-9a-fA-F]{1,4})";
        let hexseq = "(" + hex4 + "(:" + hex4 + ")*)";
        let hexpart = "(" + hexseq + "|(" + hexseq + "::" + hexseq + "?)|(::" + hexseq + "?))";

        let octet99 = "([1-9]?[0-9])";              // match 0-99 leading zeros not allowed
        let octet199 = "(1[0-9][0-9])";              // match 100-199
        let octet255 = "(2(([0-4][0-9])|5[0-5]))";   // match 200-255

        let ipv4octet = `(${octet99}|${octet199}|${octet255})`;
        let ipv4address = `(${ipv4octet}\\.${ipv4octet}\\.${ipv4octet}\\.${ipv4octet})`;

        let ipv6address = "(" + hexpart + "(:" + ipv4address + ")?)";
        let ipv6reference = "(\\[" + ipv6address + "])";

        // host         = hostname | ipv4address | ipv6reference
        let host = `(${hostname}|${ipv4address}|${ipv6reference})`;

        return host;
    }

    /**
     * Return regexp matching port number
     *
     * @return string
     */
    function port() {
        return "[0-9]+";
    }


    /**
        * Return regexp matching distinguishedName from Section 3 of RFC 2253
        *
        * @return string
        */
    function distinguishedName() {

        let quotation = '"';
        let special = "[,=+<>#;]";
        let hexchar = "[a-fA-F0-9-]";

        let attributeType = attributeTypes();

        // stringchar = <any character except one of special, "\" or QUOTATION >
        let stringchar = '[^,=+<>#;"\\\\]';

        // quotechar  = <any character except "\" or QUOTATION >
        let quotechar = '[^"\\\\]';

        // hexpair    = hexchar hexchar
        let hexpair = `(${hexchar})`;

        // pair       = "\" ( special / "\" / QUOTATION / hexpair )
        let pair = `\\\\(${special}|\\\\|${quotation}|${hexpair})`;

        // hexstring  = 1*hexpair
        let hexstring = `${hexpair}+`;

        // string     = *( stringchar / pair )
        //             / "#" hexstring
        //             / QUOTATION *( quotechar / pair ) QUOTATION ; only from v2
        let string = `((${stringchar}|${pair})*)|#${hexstring}|(${quotation}(${quotechar}|${pair})*${quotation})`;

        //attributeValue = string
        let attributeValue = string;

        // attributeTypeAndValue = attributeType "=" attributeValue
        let attributeTypeAndValue = `${attributeType}=${attributeValue}`;

        // name-component = attributeTypeAndValue *("+" attributeTypeAndValue)
        let name_component = `${attributeTypeAndValue}(\\+${attributeTypeAndValue})*`;

        // name       = name-component *("," name-component)
        let name = `${name_component}(,${name_component})*`;

        // distinguishedName = [name]                    ; may be empty string
        let distinguishedName = `(${name})?`;

        return distinguishedName;
    }

    /**
        * return regexp matching AttributeDescription from Section 4.1.5 of RFC 2251
        *
        * @return string
        */
    function attributeDescription() {

        let attributeType = attributeTypes();

        // <opt-char> ::=  ASCII-equivalent letters, numbers and hyphen
        // <option>   ::= <opt-char> <opt-char>*
        let option = "[a-zA-Z0-9-]+";

        // <options>  ::= <option> | <option> ";" <options>
        let options = `${option}(;${option})*`;

        // <AttributeDescription> ::= <AttributeType> [ ";" <options> ]
        let attributeDescription = `${attributeType}(;${options})?`;

        return attributeDescription;
    }

    /**
     * return regexp matching AttributeType from Section 4.1.5 of RFC 2251
     *
     * @return string
     */
    function attributeTypes() {
        let alpha = "[a-zA-Z]";
        let digit = "[0-9]";

        // keychar  = ALPHA / DIGIT / "-"
        let keychar = "[a-zA-Z0-9-]";

        // oid      = 1*DIGIT *("." 1*DIGIT)
        let oid = `${digit}+(\\.${digit}+)*`;

        // attributeType = (ALPHA 1*keychar) / oid
        let attributeType = `(${alpha}(${keychar})+)|${oid}`;

        return attributeType;
    }



    if (value !== "") {
        //remove subnet part

        let scheme = "ldap(s)?";

        // hostport = hostport from Section 5 of RFC 1738
        let hostport = hostports();

        // dn       = distinguishedName from Section 3 of RFC 2253
        let dn = distinguishedName();

        // attrdesc = AttributeDescription from Section 4.1.5 of RFC 2251
        let attrdesc = attributeDescription();

        // attributes = attrdesc *("," attrdesc)
        let attributes = `${attrdesc}(, ${attrdesc})*`;

        // scope    = "base" / "one" / "sub"
        let scope = "base|one|sub";

        let ldapurl = `${scheme}://(${hostport})?` +
            "(/" +
            `(${dn}` +
            "(\\?" +
            `(${attributes})?` +
            "(" +
            `\\?(${scope})?` +
            //    "(\\?($filter)?(\\?$extensions)?)?".  // not supported at the moment
            ")?" +
            ")?" +
            ")?" +
            ")?";

        var re =   new RegExp(ldapurl);
        return re.test(value);
    }
    return true;
}

