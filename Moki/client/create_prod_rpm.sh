#!/usr/bin/sh

# go to a temp directory we checked out the git repository
# set as WORKDIR

#DIR=Moki/client
REP=$branch_name
REPOTYPE="prod"
NAME=moki-client
SPEC=$NAME.spec
# architecture - static for now
RPMARCH=x86_64
RPM_SRC_DIR="/var/lib/jenkins/rpmbuild/RPMS/x86_64"
# repository type - dev for this automatic build
RPM_VERSION=`cat $SPEC|grep -e "^Version:"|awk '{print $2}'`
# repo location
if [[ "$branch" == "master" ]] ; then 
	RPM_REPO_DIR="$HOME/repointernal/rpm/dev/$RPMARCH"
else
	RPM_REPO_DIR="$HOME/repointernal/rpm/branch/$branch/$RPMARCH"
fi

sed -i "s/Release:.*/Release:\t$BUILD_NUMBER/" $SPEC

# vendorize the package.json
# use il package.json
ln -sf package.json package-intuitive.json

#cd $DIR

#FIXES
rm -rf node_modules
#sed -i 's/"homepage.*/"homepage": ".",/g' package.json

# clean package-lock.json
#rm -f package-lock.json

# build the package
make clean
make rpm

### upload rpms

mkdir -p $RPM_REPO_DIR


mv $RPM_SRC_DIR/$NAME-${RPM_VERSION}-${BUILD_NUMBER}.x86_64.rpm $RPM_REPO_DIR

if test -f $RPM_SRC_DIR/$NAME-dev-${RPM_VERSION}-${BUILD_NUMBER}.x86_64.rpm ; then
  mv $RPM_SRC_DIR/$NAME-dev-${RPM_VERSION}-${BUILD_NUMBER}.x86_64.rpm $RPM_REPO_DIR
fi

rm ~/rpmbuild/SOURCES/$NAME-${RPM_VERSION}-${BUILD_NUMBER}.tar.gz


#=========RPM upload==========

# updating repodata

cd $RPM_REPO_DIR

createrepo ./

# sync to S3
aws s3 sync --delete $HOME/repointernal/rpm/$REPOTYPE s3://repointernal/rpm/$REPOTYPE

echo $?
