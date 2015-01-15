#!/bin/sh

appname=${0##*/}
appname=${appname%.sh}

buildscript/makexpi.sh $appname version=0
