# SketchSlides

A modern Progressive Web App (PWA) for creating customizable image slideshows, specifically designed for artists practicing gesture drawing and figure drawing.

Try it now at [sketchslides.oliver.tj](https://sketchslides.oliver.tj)

## Features

- 🎨 **Artist-Focused Features**
  - Customizable timing for each slide
  - Image flipping
  - Greyscale mode
  - 3x3 grid overlay
  - Optional timer display and sound cues

- ⚡ **Modern Web Features**
  - Works offline (PWA)
  - Installable on any device
  - Responsive design for desktop and mobile
  - File system access for easy folder selection
  - Drag and drop support

- ⚙️ **Flexible Session Types**
  - Fixed intervals (preset or custom durations)
  - Custom schedules with multiple intervals
  - Relaxed mode for self-paced practice

## Installation

### As a PWA (Recommended)
1. Visit [sketchslides.oliver.tj](https://sketchslides.oliver.tj)
2. Your browser will prompt you to install the app
3. Once installed, SketchSlides will work offline and can be launched from your device like any other app

### From Source

- Clone the repository
   ```bash
   git clone https://github.com/olivertj/sketchslides
   ```

- Install dependencies
   ```bash
   npm install
   ```

- Run development server
   ```bash
   npm run dev
   ```

- Build for production
   ```bash
   npm run build
   ```

## Usage

1. **Select Your Images**
   - Click "Select Folder" (on supported browsers)
   - Or use "Select Files" to choose individual images
   - Alternatively, drag and drop your images/folder

2. **Choose Session Type**
   - Fixed: Set consistent intervals (30s, 1min, 2min, or custom)
   - Schedule: Create custom interval sequences
   - Relaxed: Manual control with no timer

3. **Customize Your Experience**
   - Toggle image modifications (flip, greyscale)
   - Enable/disable grid overlay
   - Adjust timer settings and sound cues
   - Configure window resize behavior (in standalone mode)

4. **During the Slideshow**
   - Use on-screen controls or keyboard shortcuts
   - Access image information
   - Pause/resume the timer
   - Navigate between images
   - Delete images (when using folder selection)

## Keyboard Shortcuts

- `Left Arrow`: Previous image
- `Right Arrow`: Next image
- `Space`: Pause/Resume
- `Esc`: Exit slideshow

## Technical Details

Built with:
- React 18
- TypeScript
- Vite
- TailwindCSS
- Workbox (for PWA functionality)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you find this tool useful, you can support the development via:
- [Ko-fi](https://ko-fi.com/loreviq)

## Contact

For questions or suggestions, contact: oliver.tj@oliver.tj

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.