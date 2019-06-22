import path from 'path';

import imagemin = from 'imagemin';
import imageminJpegtran = from 'imagemin-jpegtran';
import imageminPngquant = from 'imagemin-pngquant';
import loaderUtils from 'loader-utils';
import validateOptions from 'schema-utils';

import schema from './options.json'

const jpegPlugin = imageminJpegtran(),
const pngPlugin = imageminPngquant({
	quality: [0.6, 0.8]
})

export default function loader(content) {
    const callback = this.async();
	this.cacheable && this.cacheable();
	this.value = content;

    const options = loaderUtils.getOptions(this) || {};

    validateOptions(schema, options, 'Spinach');

	const context = options.context || this.rootContext;
	
    async function run() {
        const url = loaderUtils.interpolateName(this, options.name, {
            context,
            content,
        });

        let outputPath = url;

        if (options.outputPath) {
            if (typeof options.outputPath === 'function') {
                outputPath = options.outputPath(url, this.resourcePath, context);
            } else {
                outputPath = path.posix.join(options.outputPath, url);
            }
        }

        let publicPath = `__webpack_public_path__ + ${JSON.stringify(outputPath)}`;

        if (options.publicPath) {
            if (typeof options.publicPath === 'function') {
                publicPath = options.publicPath(url, this.resourcePath, context);
            } else {
                publicPath = `${
				options.publicPath.endsWith('/')
					? options.publicPath
					: `${options.publicPath}/`
				}${url}`;
            }

            publicPath = JSON.stringify(publicPath);
		}

		const buffer = Buffer.from(`"${content.toString('base64')}"`, "base64")

		const files = await imagemin.buffer(buffer, {
			plugins: [
				jpegPlugin,
				pngPlugin,
			]
		});
	
		console.log(files);

		return `module.exports = ${publicPath};`
    }

    run().then((result) => {
		callback(null, result)
    })
}

export const raw = true;