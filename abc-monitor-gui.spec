Name:		abc-monitor-gui
Version:       4.6.0
Release:	1%{?dist}
Summary:	GUI part of abc-monitor

Group:		Applications/Internet
License:	Commercial
#URL:
Source:		%{name}-%{version}-%{release}.tar.gz
BuildArch:	x86_64
BuildRoot:	%{_tmppath}/%{name}-%{version}-%{release}-root
Requires:	elasticsearch
Requires:	nodejs >= 8.9.4
BuildRequires:  npm, yarn
Obsoletes:	sbc-events-gui
Requires:	nodejs
Requires:	yarn
Requires: python3
Requires: python36-ldap

%description
ABC Monitor GUI

%prep

%setup -q

%build

%install
#rm -rf %{buildroot}
mkdir -p %{buildroot}/opt/abc-monitor-gui/
mkdir -p %{buildroot}/opt/abc-monitor-gui/www
install 404.html %{buildroot}/opt/abc-monitor-gui/www/
install 50x.html %{buildroot}/opt/abc-monitor-gui/www/
# install phantomjs
mkdir -p %{buildroot}/opt/abc-monitor-gui/node_modules
npm --prefix %{buildroot}/opt/abc-monitor-gui/ install phantomjs
# install sendmail
npm --prefix %{buildroot}/opt/abc-monitor-gui/ install sendmail --save
# install process
npm --prefix %{buildroot}/opt/abc-monitor-gui/ install process
# remove jenkins paths from the installed files
find %{buildroot}/opt/abc-monitor-gui/node_modules -type f -exec sed -i "s#$RPM_BUILD_ROOT##g" \{} \;
install phantom-server.js %{buildroot}/opt/abc-monitor-gui/
install sendEmail.js %{buildroot}/opt/abc-monitor-gui/
# install logstash users file
mkdir -p %{buildroot}/var/lib/logstash
install users.json %{buildroot}/var/lib/logstash/users.json
install sns.json %{buildroot}/var/lib/logstash/sns.json
# install moki
install -d %{buildroot}/usr/share/Moki
cp -r Moki/* %{buildroot}/usr/share/Moki/

# install moki ldap-auth comp
install -d %{buildroot}/usr/sbin
cp Moki/ldap_auth/ldap-auth %{buildroot}/usr/sbin/

# install moki service file
install -d %{buildroot}/usr/lib/systemd/system
install -m 0644 moki-client.service %{buildroot}/usr/lib/systemd/system/
install -m 0644 moki-server.service %{buildroot}/usr/lib/systemd/system/
install -m 0644 ldap-auth.service %{buildroot}/usr/lib/systemd/system/

# perform moki install
cd %{buildroot}/usr/share/Moki/client
npm install
cd %{buildroot}/usr/share/Moki/server
npm install
# fix absolute paths that npm leaves there due to npm feature/bug
find %{buildroot}/usr/share/Moki -name "package.json" -exec sed -i 's#%{buildroot}##' '{}' \;

%clean
rm -rf %{buildroot}

%post
# create node-web user, if not existing already
/usr/bin/getent group node-web >/dev/null || /usr/sbin/groupadd -r node-web
/usr/bin/getent passwd node-web >/dev/null || /usr/sbin/useradd -r -d /opt -s /sbin/nologin -g node-web node-web
/usr/sbin/usermod -a -G logstash node-web
set -o pipefail

# change ownership to allow transformer write
chown node-web /var/lib/logstash/users.json
chown node-web /var/lib/logstash/sns.json

systemctl daemon-reload
echo "Enabling and restarting moki services"
systemctl -q enable moki-server moki-client ldap-auth
systemctl -q restart moki-server moki-client ldap-auth

%files
/opt/abc-monitor-gui/
# empty dir
#%defattr(-,root,root,-)
#%doc
#/opt/abc-monitor-gui/node_modules/
/var/lib/logstash/users.json
/var/lib/logstash/sns.json
/usr/share/Moki/
/usr/lib/systemd/system/moki-server.service
/usr/lib/systemd/system/moki-client.service
/usr/lib/systemd/system/ldap-auth.service
/usr/sbin/ldap-auth

%changelog
