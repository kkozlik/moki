#!/usr/bin/bash

if [[ ! -v NODE_ENV ]] || [[ $NODE_ENV != 'production' ]]; then
    exit
fi

DIR=`mktemp -d`

for i in build/static/js/*.js; do
    if [[ -v GENERATE_SOURCEMAP ]] && [[ $GENERATE_SOURCEMAP == 'false' ]]; then
        # w/o source map
        npx terser $i -c drop_console=true -o ${DIR}/`basename $i` ;
    else
        # with source map
        npx terser $i --source-map "content='${i}.map'" -c drop_console=true -o ${DIR}/`basename $i` ;
    fi
done

if [[ ! -d build/static/js_orig ]]; then
    mkdir build/static/js_orig
fi
rm -rf build/static/js_orig/*;
cp -a build/static/js/* build/static/js_orig/;
cp -a ${DIR}/* build/static/js;

rm ${DIR}/*
rmdir ${DIR}
