import path from 'path';

import imagemin = from 'imagemin';
import imageminJpegtran = from 'imagemin-jpegtran';
import imageminPngquant = from 'imagemin-pngquant';
import loaderUtils from 'loader-utils';
import validateOptions from 'schema-utils';

import schema from './options.json'

const defaultJpegPlugin = imageminJpegtran(),
const defaultPngPlugin = imageminPngquant({
	quality: [0.7, 0.9]
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


		try {
			const jpegPlugin = options.jpeg
				? imageminJpegtran(options.jpeg)
				: defaultJpegPlugin

			const pngPlugin = options.png
				? defaultPngPlugin(options.png)
				: defaultPngPlugi


			const files = await imagemin.buffer(buffer, {
				plugins: [
					jpegPlugin,
					pngPlugin,
				]
			});

			return `module.exports = ${publicPath};`
		}
		catch(e) {
			return e
		}
    }

    run().then((result) => {
		callback(null, result)
    }).catch((err) => {
		callback(err)
	})
}

export const raw = true;