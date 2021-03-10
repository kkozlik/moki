%define moki_user moki
%define moki_group  moki

Name:		  moki-server
Version:  10.0.1
#Release:	1%{dist}
Release:	1.amzn2
Summary:	API part of moki

Group:		Applications/Internet
License:	Commercial
#URL:
Source:		%{name}-%{version}-%{release}.tar.gz
BuildArch:	x86_64
BuildRoot:	%{_tmppath}/%{name}-%{version}-%{release}-root
Requires:	nodejs >= 14.15.5
#BuildRequires:  npm, yarn
#Requires:	nodejs

%description
moki-server aka express API

#DEV package
%package	dev
Summary:	moki-server express API dev

%description dev
moki-server express API developement pack

%prep

%setup -q

%build

%pre
# 
getent group %{moki_user} > /dev/null || %{_sbindir}/groupadd -r %{moki_user}
getent passwd %{moki_user} > /dev/null || \
  | useradd -r -d /usr/share/Moki -g %{moki_user}  -s /sbin/nologin -c "moki user" %{moki_user}
exit 0

%install
# install moki
install -d %{buildroot}/usr/share/Moki/server
cp -r js %{buildroot}/usr/share/Moki/server/
cp -r src %{buildroot}/usr/share/Moki/server/
#cp -r report %{buildroot}/usr/share/Moki/server/
cp package*.json %{buildroot}/usr/share/Moki/server

# install moki service file
install -d %{buildroot}/usr/lib/systemd/system
install -m 0644 moki-server.service %{buildroot}/usr/lib/systemd/system/

# perform moki API install
cd %{buildroot}/usr/share/Moki/server
npm install
mv node_modules node_modules_dev
NODE_ENV=production npm install --production
mv node_modules node_modules_prod

# fix absolute paths that npm leaves there due to npm feature/bug
find %{buildroot}/usr/share/Moki -name "package.json" -exec sed -i 's#%{buildroot}##' '{}' \;

%clean
rm -rf %{buildroot}

%post

# symlinking correct node_modules
ln -rfs \
   /usr/share/Moki/server/node_modules_prod \
   /usr/share/Moki/server/node_modules

systemctl daemon-reload
echo "Enabling and restarting moki-server"
systemctl -q enable moki-server
systemctl -q restart moki-server

%post dev

# symlinking correct node_modules
ln -rfs \
   /usr/share/Moki/server/node_modules_dev \
   /usr/share/Moki/server/node_modules

systemctl daemon-reload
echo "Enabling and restarting moki-server dev"
systemctl -q enable moki-server
systemctl -q restart moki-server


%files
%defattr(-,%{moki_user},%{moki_group})
/usr/share/Moki/server/node_modules_prod
/usr/share/Moki/server/js
/usr/share/Moki/server/src
#/usr/share/Moki/server/report
/usr/share/Moki/server/package*.json
/usr/lib/systemd/system/moki-server.service

%files dev
%defattr(-,%{moki_user},%{moki_group})
/usr/share/Moki/server/node_modules_dev
/usr/share/Moki/server/js
/usr/share/Moki/server/src
#/usr/share/Moki/server/report
/usr/share/Moki/server/package*.json
/usr/lib/systemd/system/moki-server.service

%changelog
* Fri Feb 19 2021 Vladimir Broz <vlada@intuitivelabs.com> 10.0.1
- init version after modules implemenration and dev pkg fixes

* Fri Feb 5 2021 Quentin Burgess <qutn.burgess@gmail.com> 10.0.0
- initial spec file
