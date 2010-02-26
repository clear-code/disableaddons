setlocal
set appname=%~n0

rmdir "jar_temp" /s /q
del "%appname%.jar"

mkdir jar_temp
xcopy content jar_temp\content /i /s
xcopy locale jar_temp\locale /i /s
xcopy skin jar_temp\skin /i /s

cd jar_temp
chmod -cfr 644 *.jar *.js *.light *.inf *.rdf *.cfg *.manifest

zip -r0 "..\%appname%.jar" content locale skin
cd ..

rmdir "jar_temp" /s /q

endlocal
