#!/bin/bash
# 设置node内存限制
export NODE_OPTIONS=--max_old_space_size=4096

dir_name=$(pwd)
date_now=$(date +%Y%m%d-%H%M%S)
path_prefix=$(date +%Y/%m)
oss_project=$1
api_version=$2

echo "nvm current"

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
  cdn_domain="https://front.ejingling.cn/"
  cdn_bin_path="/home/appusr/ossutil64"
elif [[ $cdn_type = $hw_cdn_type ]]
then
  cdn_domain="https://hw-front.ejingling.cn/"
  cdn_bin_path="/home/appusr/obsutil"
fi


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

"${dir_name}"/node_modules/.bin/cross-env REACT_APP_OSS="${cdn_domain}" PUBLIC_URL="${public_url}" REACT_APP_API_VERSION="${api_version}" npm run build

# 把静态资源上传到oss
mv "${dist_dir}" "${upload_dir}"
if [[ $cdn_type = $ali_cdn_type ]]
then
  # 阿里上传处理
  ${cdn_bin_path} cp -r -f "${upload_dir}" "oss://egenie-frontend/${oss_project}/${path_prefix}/${date_now}/"
  echo "阿里上传处理"
elif [[ $cdn_type = $hw_cdn_type ]]
then
  # 华为上传处理
  ${cdn_bin_path} cp -r -f -flat "${upload_dir}" "obs://egenie-frontend/${oss_project}/${path_prefix}/${date_now}/"
   echo "华为上传处理"
fi
echo "上传cdn成功"

# 把html保留到dist目录,其它静态资源删除
mkdir -p "${dist_dir}"
cp -a "${upload_dir}index.html" "${dist_dir}"
rm -rf "${dir_name:?}/${date_now}"
echo "复制html文件成功"
