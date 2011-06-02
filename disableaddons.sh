#!/bin/sh

appname=${0##*/}
appname=${appname%.sh}

cp ./buildscript/make_new.sh ./
bash ./make_new.sh $appname version=0
rm ./make_new.sh
