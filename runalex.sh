# Bash 4.0 introduced the globstar (**) option
for f in ./build/site/**/*.html
do
  # operations here
  alex $f
done
