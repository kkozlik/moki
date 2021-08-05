#!/usr/bin/sh

# go to a temp directory we checked out the git repository
# set as WORKDIR

#DIR=Moki/client
REP=$branch_name
NAME=moki-client-dev
SPEC=$NAME.spec
RPMARCH=x86_64

# use il package.json
ln -sf package.json package-intuitive.json

#cd $DIR

#FIXES
ls -la
rm -f package-lock.json
rm -rf node_modules
#sed -i 's/"homepage.*/"homepage": ".",/g' package.json

# FIXME1 - manual fix for not commited files yet
#cp /var/lib/jenkins/tmp/moki-client-dev.spec ./ 
#mv Makefile-ok Makefile

# FIXME2 - for testing now to remove the intuitive part
#rm -rf ./src/js/dashboards/Account
#rm -rf ./src/js/dashboards/Domains
#rm -rf ./src/js/dashboards/Web

RPM_VERSION=`cat $SPEC|grep -e "^Version:"|awk '{print $2}'`
sed -i "s/Release:.*/Release:\t$BUILD_NUMBER/" $SPEC

# clean package-lock.json
rm -f package-lock.json

# build the package
make TYPE=dev rpmtar
mkdir -p ~/rpmbuild/SOURCES
cp $NAME-${RPM_VERSION}-${BUILD_NUMBER}.tar.gz ~/rpmbuild/SOURCES

#cat $NAME-dev.spec

rpmbuild --clean -bb $NAME.spec


### upload rpms
# repository type - dev for this automatic build
REPOTYPE="dev"

# architecture - static for now
RPMARCH="x86_64"

# repo location
RPM_REPO_DIR="$HOME/repointernal/rpm/$REPOTYPE/$RPMARCH"
RPM_SRC_DIR="/var/lib/jenkins/rpmbuild/RPMS/x86_64"

#mv $RPM_SRC_DIR/$NAME-${RPM_VERSION}-${BUILD_NUMBER}.x86_64.rpm $RPM_REPO_DIR

if test -f $RPM_SRC_DIR/$NAME-${RPM_VERSION}-${BUILD_NUMBER}.x86_64.rpm ; then
  mv $RPM_SRC_DIR/$NAME-${RPM_VERSION}-${BUILD_NUMBER}.x86_64.rpm $RPM_REPO_DIR
fi


rm ~/rpmbuild/SOURCES/$NAME-${RPM_VERSION}-${BUILD_NUMBER}.tar.gz


#=========RPM upload==========

# updating repodata

cd $RPM_REPO_DIR

createrepo ./

# sycn to S3
aws s3 sync --delete $HOME/repointernal/rpm/$REPOTYPE s3://repointernal/rpm/$REPOTYPE
