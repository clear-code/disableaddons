#!/bin/sh

appname=${0##*/}
appname=${appname%.sh}

chmod -cfR 644 *.jar *.js *.light *.inf *.rdf *.cfg *.manifest
rm $appname.jar

zip -r0 "$appname.jar" content locale skin -x \*/.svn/\*
