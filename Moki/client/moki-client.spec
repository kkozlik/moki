%define	moki_user	moki
%define moki_group	moki

Name:		  moki-client
Version:  10.0.1
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

%package dev
Summary:	moki-client react app dev

%description dev
moki-client react appliction developement pack

%prep

%setup -q

%build
# build moki react front
#cd Moki/client
NODE_ENV=production npm install --production
npm install

npm run build
rm -rf node_modules

%pre dev
# _datadir - default to /usr/share
getent group %{moki_user} > /dev/null || %{_sbindir}/groupadd -r %{moki_user}
getent passwd %{moki_user} > /dev/null || \
    useradd -r -d /usr/share/Moki -g %{moki_user}  -s /sbin/nologin -c "moki client dev" %{moki_user}
exit 0

%install
## install html file
#mkdir -p %{buildroot}/opt/abc-monitor-gui/
#mkdir -p %{buildroot}/opt/abc-monitor-gui/www
#install html/*.html %{buildroot}/opt/abc-monitor-gui/www/

# install moki
install -d %{buildroot}/usr/share/Moki/client
cp -r package*.json %{buildroot}/usr/share/Moki/client/
cp -r public %{buildroot}/usr/share/Moki/client/
cp -r src %{buildroot}/usr/share/Moki/client/
cp -r build %{buildroot}/usr/share/Moki/

# install moki def logo
#install -d %{buildroot}/usr/share/Moki/styles/
#cp -r src/styles/logo.png %{buildroot}/usr/share/Moki/styles/

# install moki service file
install -d %{buildroot}/usr/lib/systemd/system
install -m 0644 moki-client.service %{buildroot}/usr/lib/systemd/system/

# perform moki API install
cd %{buildroot}/usr/share/Moki/client
npm install

# dump flag file
#mkdir -p %{buildroot}/etc/abc-monitor
#touch %{buildroot}/etc/abc-monitor/debug.flag

# fix absolute paths that npm leaves there due to npm feature/bug
find %{buildroot}/usr/share/Moki -name "package.json" -exec sed -i 's#%{buildroot}##' '{}' \;

%clean
rm -rf %{buildroot}

%post

%post dev
systemctl daemon-reload
echo "Enabling and restarting moki dev service"
systemctl -q enable moki-client
systemctl -q restart moki-client

%postun dev
rm -rf %{buildroot}/usr/share/Moki/client


%files
#/opt/abc-monitor-gui/www
/usr/share/Moki/build
#/usr/share/Moki/styles/
#/usr/share/Moki

%files dev
%defattr(-,%{moki_user},%{moki_group})
#/usr/share/Moki/client
/usr/share/Moki/client
/usr/lib/systemd/system/moki-client.service
#/usr/share/Moki/styles/
#/usr/share/Moki/client
#/etc/abc-monitor/debug.flag

%changelog
* Fri Feb 26 2021 Vladimir Broz <vlada@intutivelabs.com> 10.0.1
- minor changes after moki modules implementation
* Fri Feb 5 2021 Quentin Burgess <qutn.burgess@gmail.com> 10.0.0
- initial spec file
