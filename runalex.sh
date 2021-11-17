# Bash 4.0 introduced the globstar (**) option
for f in ./build/site/**/*.html
do
  # The AlexJS tool can be found at https://alexjs.com
  alex $f
done
