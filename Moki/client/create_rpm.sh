#!/usr/bin/sh

# see dash(1):
#
# -e errexit    If not interactive, exit immediately if any untested command fails.	 The
#			    exit status of a command is considered to be explicitly tested if the com‐
#			    mand is used to control an if, elif, while, or until; or if the command is
#			    the left hand operand of an “&&” or “||” operator.
# -x xtrace	    Write each command to standard error (preceded by a ‘+ ’) before it is exe‐
#			    cuted.  Useful for debugging.
set -ex

# check type of build - public / private Moki
if [[ "$1" == "private" ]] ; then
	REPO_TYPE="repointernal"
	# vendorize the package.json
	# use il package.json
	ln -sf package-intuitive.json package.json
else
	REPO_TYPE="repopublic"
fi

## configuration and variables section
REP=$branch_name
# name of the production build
NAME=moki-client
SPEC=${NAME}.spec
# name of the dev build
NAME_DEV=moki-client-dev
SPEC_DEV=${NAME_DEV}.spec
# architecture - static for now
RPMARCH=x86_64
RPM_SRC_DIR="/var/lib/jenkins/rpmbuild/RPMS/x86_64"
# rpm version is stored only in the production spec
RPM_VERSION=`cat $SPEC|grep -e "^Version:"|awk '{print $2}'`
# repo location
if [[ "$branch" == "master" ]] ; then 
	RPM_LOCAL_REPO_DIR="$HOME/$REPO_TYPE/rpm/dev/$RPMARCH"
	RPM_REMOTE_REPO_URL="s3://$REPO_TYPE/rpm/dev/$RPMARCH"
else
	RPM_LOCAL_REPO_DIR="$HOME/$REPO_TYPE/rpm/branch/$branch/$RPMARCH"
	RPM_REMOTE_REPO_URL="s3://$REPO_TYPE/rpm/branch/$branch/$RPMARCH"
fi

## code section
# update the release with the jenkins' BUILD_NUMBER
sed -i "s/Release:.*/Release:\t$BUILD_NUMBER/" $SPEC
sed -i "s/Release:.*/Release:\t$BUILD_NUMBER/" $SPEC_DEV


#FIXES
rm -rf node_modules
#sed -i 's/"homepage.*/"homepage": ".",/g' package.json

# clean package-lock.json
rm -f package-lock.json

# clean previous tarball/rpm
make TYPE=dev clean
make clean

# build the dev package
make TYPE=dev rpm

# build the production package
make rpm

### upload rpms

mkdir -p $RPM_LOCAL_REPO_DIR
if test -f $RPM_SRC_DIR/${NAME_DEV}-${RPM_VERSION}-${BUILD_NUMBER}.x86_64.rpm ; then
  mv $RPM_SRC_DIR/${NAME_DEV}-${RPM_VERSION}-${BUILD_NUMBER}.x86_64.rpm $RPM_LOCAL_REPO_DIR
fi

rm ~/rpmbuild/SOURCES/${NAME_DEV}-${RPM_VERSION}-${BUILD_NUMBER}.tar.gz

if test -f $RPM_SRC_DIR/${NAME}-${RPM_VERSION}-${BUILD_NUMBER}.x86_64.rpm ; then
  mv $RPM_SRC_DIR/${NAME}-${RPM_VERSION}-${BUILD_NUMBER}.x86_64.rpm $RPM_LOCAL_REPO_DIR
fi

rm ~/rpmbuild/SOURCES/${NAME}-${RPM_VERSION}-${BUILD_NUMBER}.tar.gz

#=========RPM upload==========

# updating repodata

cd $RPM_LOCAL_REPO_DIR

createrepo ./

# sync to S3
aws s3 sync --delete $RPM_LOCAL_REPO_DIR $RPM_REMOTE_REPO_URL

echo $?
