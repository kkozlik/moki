%global	moki_user	mokic
%global moki_group	mokic
# turn off all the brp* processing; it is NOT need for js projects
%define __os_install_post %{nil}

Name:		  moki-client-dev
Version:  10.1.0
#Release:  1%{?dist}
Release:	1.amzn2
Summary:	GUI part of moki (dev)

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
moki-client react appliction developement pack

%prep

%setup -q

%build
# build moki react front
npm install

npm run build

%pre
# _datadir - default to /usr/share
getent group %{moki_group} > /dev/null || %{_sbindir}/groupadd -r %{moki_group}
getent passwd %{moki_user} > /dev/null || \
    useradd -r -d /usr/share/Moki -g %{moki_group}  -s /sbin/nologin -c "moki client dev" %{moki_user}
exit 0

%install
# install moki
install -d %{buildroot}/usr/share/Moki/client
cp -r package*.json %{buildroot}/usr/share/Moki/client/
cp -r public %{buildroot}/usr/share/Moki/client/
cp -r src %{buildroot}/usr/share/Moki/client/
cp -r build %{buildroot}/usr/share/Moki/

# install moki service file
install -d %{buildroot}/usr/lib/systemd/system
install -m 0644 moki-client.service %{buildroot}/usr/lib/systemd/system/

# install nginx configuration file
install -d %{buildroot}/etc/nginx/conf.d
install -m 0644 nginx/monitor-dev.conf %{buildroot}/etc/nginx/conf.d/monitor.conf

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
systemctl daemon-reload
echo "Enabling and restarting moki dev service"
systemctl -q enable moki-client
systemctl -q restart moki-client
echo "Restarting nginx server"
systemctl -q restart nginx

%preun
%systemd_preun moki-client.service

%postun
rm -rf %{buildroot}/usr/share/Moki/client
%systemd_postun_with_restart moki-client.service

%files
%defattr(-,%{moki_user},%{moki_group})
/usr/share/Moki/client
/usr/lib/systemd/system/moki-client.service
/usr/share/Moki/build
/etc/nginx/conf.d/monitor.conf
#/etc/abc-monitor/debug.flag

%changelog
* Thu Jul 22 2021 Cristian Constantin <cristian@intutivelabs.com> 10.1.0
- provide separate spec files for production and development
* Fri Feb 26 2021 Vladimir Broz <vlada@intutivelabs.com> 10.0.1
- minor changes after moki modules implementation
* Fri Feb 5 2021 Quentin Burgess <qutn.burgess@gmail.com> 10.0.0
- initial spec file
