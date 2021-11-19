%global	moki_user	mokic
%global moki_group	mokic

Name:		  moki-client
Version:  10.1.0
#Release:  1%{?dist}
Release:	1.amzn2
Summary:	GUI part of moki

Group:		Applications/Internet
License:	Commercial
#URL:
Source:		%{name}-%{version}-%{release}.tar.gz
BuildArch:	x86_64
BuildRoot:	%{_tmppath}/%{name}-%{version}-%{release}-root
#Requires:	elasticsearch
#BuildRequires:  npm, yarn
#Requires:	yarn

%description
moki-client aka react application

%prep

%setup -q

%build
# build moki react front
NODE_ENV=production npm install --production
# npm install

# use _either_ of the following statements for building an optimized js app.

# - if source maps for js code is needed in the production build (i.e. do NOT set GENERATE_SOURCEMAP env variable).
#   however, beware that in this case all `console.*` statements from source code are still present in the `*.js.map` files and can
#   be inspected easily by anyone having access to the GUI:
#
# NODE_ENV=production npm run build
#
# - removes all the console log statements; does not produce js source map:
#
GENERATE_SOURCEMAP=false NODE_ENV=production npm run build

# rm -rf node_modules

%install
# install moki
install -d %{buildroot}/usr/share/Moki/
cp -r build %{buildroot}/usr/share/Moki/

# install nginx configuration file
install -d %{buildroot}/etc/nginx/conf.d
#install -m 0644 nginx/monitor-prod.conf %{buildroot}/etc/nginx/conf.d/monitor.conf

# dump flag file
#mkdir -p %{buildroot}/etc/abc-monitor
#touch %{buildroot}/etc/abc-monitor/debug.flag

%clean
rm -rf %{buildroot}

%post
echo "Restarting nginx server"
systemctl -q restart nginx

%postun
echo "Restarting nginx server"
systemctl -q restart nginx

%files
/usr/share/Moki/build
#/etc/nginx/conf.d/monitor.conf

%changelog
* Thu Jul 22 2021 Cristian Constantin <cristian@intutivelabs.com> 10.1.0
- provide separate spec files for production and development
* Fri Feb 26 2021 Vladimir Broz <vlada@intutivelabs.com> 10.0.1
- minor changes after moki modules implementation
* Fri Feb 5 2021 Quentin Burgess <qutn.burgess@gmail.com> 10.0.0
- initial spec file
