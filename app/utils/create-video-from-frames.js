import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export const createVideoFromFrames = async (data, message, canvas, frames, config, ratio, output) => {
  return new Promise(async (resolve, reject) => {
    const ctx = canvas.getContext('2d');
    let canvasFrames = [];
    let inputPaths = [];

    let inc = 0;

    message.innerHTML = 'Loading: ffmpeg/WASM';

    const ffmpeg = new FFmpeg();

    const baseURL = '/@ffmpeg/core@0.12.6/dist/esm';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      classWorkerURL: '../../@ffmpeg/ffmpeg/dist/esm/worker.js',
    });

    const createRasterizedImage = async () => {
      const virtualImage = new Image();
      virtualImage.src = frames[inc];

      virtualImage.addEventListener('load', async () => {
        message.innerHTML = !data ? '' : `Preparing frame: ${inc} of ${frames.length - 1}`;
        ctx.clearRect(0, 0, config.chartWidth, config.chartHeight);
        ctx.drawImage(virtualImage, 0, 0, config.chartWidth, config.chartHeight);
        canvasFrames.push(canvas.toDataURL('image/jpeg'));
        inc++;
        if (inc < frames.length) {
          createRasterizedImage();
        } else {
          for (let index = 0; index < canvasFrames.length; index++) {
            const name = `frame-${index}.jpeg`;
            const file = canvasFrames[index];
            message.innerHTML = `Writing file: ${name}`;
            await ffmpeg.writeFile(name, await fetchFile(file));
            inputPaths.push(`file ${name} duration 0.1`);
          }

          await ffmpeg.writeFile('input_frames.txt', inputPaths.join('\n'));
          message.innerHTML = 'Transcoding start';

          ffmpeg.on('progress', ({ progress, time }) => {
            message.innerHTML = `Transcoding: ${time / 1000000}s`;
          });

          await ffmpeg.exec([
            '-f',
            'concat',
            '-r',
            '60',
            '-i',
            'input_frames.txt',
            '-vcodec',
            'libx264',
            '-b:v',
            '3000k',
            '-s',
            `${ratio}x1080`,
            `${output}.mp4`,
          ]);

          const file = await ffmpeg.readFile(`${output}.mp4`);
          const src = URL.createObjectURL(new Blob([file.buffer], { type: 'video/mp4' }));
          message.innerHTML = 'Transcoding complete';
          resolve(src);
        }
      });

      virtualImage.addEventListener('error', (error) => {
        reject(error);
      });
    };
    createRasterizedImage();
  });
};
