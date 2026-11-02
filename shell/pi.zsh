# Source from ~/.zshrc. Keep HF_TOKEN available to tools other than Pi.
pi() {
  ( unset HF_TOKEN; command pi "$@" )
}
