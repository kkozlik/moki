NAME=abc-monitor-gui


rpmtar:
	RPM_VERSION=`cat $(NAME).spec|grep -e "^Version:"|awk '{print $$2}'`; \
	RPM_RELEASE=`cat $(NAME).spec|grep -e "^Release:"|awk '{print $$2}'`; \
        echo "RPM_VERSION=$${RPM_VERSION}"; \
        echo "RPM_RELEASE=$${RPM_VERSION}"; \
        tar -C .. \
        --exclude=$(notdir $(CURDIR))/tmp \
        --exclude=.svn* \
        --exclude=.git* \
        --exclude=.\#* \
        --exclude=*.[do] \
        --exclude=*.la \
        --exclude=*.lo \
        --exclude=*.so \
        --exclude=*.il \
        --exclude=*.gz \
        --exclude=*.bz2 \
        --exclude=*.tar \
        --exclude=*~ \
        -cf - $(notdir $(CURDIR)) | \
        (mkdir -p tmp/_tar1; mkdir -p tmp/_tar2 ; \
        cd tmp/_tar1; tar -xf - ) && \
        mv tmp/_tar1/$(notdir $(CURDIR)) \
        tmp/_tar2/"$(NAME)-$${RPM_VERSION}" && \
        (cd tmp/_tar2 && tar -zcf ../../"$(NAME)-$${RPM_VERSION}-$${RPM_RELEASE}".tar.gz "$(NAME)-$${RPM_VERSION}" ) ; \
        rm -rf tmp



