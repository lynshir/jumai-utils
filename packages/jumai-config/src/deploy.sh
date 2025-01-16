#!/bin/bash -il
export NODE_OPTIONS=--max_old_space_size=4096
export SENTRY_LOG_LEVEL="info"

echo "pwd的路径是:$(pwd)"
dir_name=$(pwd)
date_now=$(date +%Y%m%d-%H%M%S)
path_prefix=$(date +%Y/%m)
oss_project=$1
api_version=$2

# cdn类型,默认阿里云,保持和原来兼容
ali_cdn_type="1"
hw_cdn_type="2"
cdn_type=""
cdn_bin_path=""
if [[ $3 = $hw_cdn_type || $3 = $ali_cdn_type ]]
then
  cdn_type=$3
else
  cdn_type=$ali_cdn_type
fi

# 写死华为cdn
cdn_type=$hw_cdn_type

# 不同oss对应的域名
cdn_domain=""
if [[ $cdn_type = $ali_cdn_type ]]
then
  cdn_domain="https://front.jmaihome.cn/"
  cdn_bin_path="/home/appusr/ossutil64"
elif [[ $cdn_type = $hw_cdn_type ]]
then
  cdn_domain="https://front.jmaihome.cn/"
  cdn_bin_path="/home/appusr/obsutil"
fi

echo "dir_name: ${dir_name}"
# 打包生成的目录
dist_dir="${dir_name}/dist/"

# 上传到oss的目录
upload_dir="${dir_name}/${date_now}/"

# 最终到webpack的public_url
public_url="${cdn_domain}${oss_project}/${path_prefix}/${date_now}/"

echo "api_version: ${api_version}"
echo "cdn上传工具地址: ${cdn_bin_path}"
echo "public_url路径: ${public_url}"

# 打包
if test -e "${dir_name}"/node_modules/.bin/cross-env
then
chmod +x "${dir_name}"/node_modules/.bin/cross-env
fi

if test -e "${dir_name}"/node_modules/.bin/egenie-react-scripts
then
chmod +x "${dir_name}"/node_modules/.bin/egenie-react-scripts
fi

if test -e "${dir_name}"/node_modules/.bin/egenie-bundler-cli
then
chmod +x "${dir_name}"/node_modules/.bin/egenie-bundler-cli
fi

if test -e "${dir_name}"/node_modules/.bin/jumai-bundler-cli
then
chmod +x "${dir_name}"/node_modules/.bin/jumai-bundler-cli
fi

if test -e "${dir_name}"/node_modules/.bin/sentry-cli
then
chmod +x "${dir_name}"/node_modules/.bin/sentry-cli
fi

NODE_VERSION="16.10.0"
#nvm use v14.21.3
# 解析传入的参数
if [ "$#" -ge 4 ]; then
    NODE_VERSION="$4"
fi
# 使用指定的Node.js版本
nvm use $NODE_VERSION

"${dir_name}"/node_modules/.bin/cross-env REACT_APP_OSS="${cdn_domain}" PUBLIC_URL="${public_url}" REACT_APP_API_VERSION="${api_version}" npm run build

# 把静态资源上传到oss
mv "${dist_dir}" "${upload_dir}"
if [[ $cdn_type = $ali_cdn_type ]]
then
  # 阿里上传处理
  ${cdn_bin_path} cp -r -f "${upload_dir}" "oss://jumai-frontend/${oss_project}/${path_prefix}/${date_now}/"
  echo "阿里上传处理"
elif [[ $cdn_type = $hw_cdn_type ]]
then
  # 华为上传处理
  ${cdn_bin_path} cp -r -f -flat "${upload_dir}" "obs://jumai-frontend/${oss_project}/${path_prefix}/${date_now}/"
   echo "华为上传处理"
fi
echo "上传cdn成功"

# 把html保留到dist目录,其它静态资源删除
mkdir -p "${dist_dir}"
echo ${upload_dir}
echo ${dist_dir}
cp -a "${upload_dir}index.html" "${dist_dir}"
rm -rf "${dir_name:?}/${date_now}"
echo "复制html文件成功"