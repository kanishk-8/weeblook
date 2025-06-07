# WeebLook - Manga Reader

A modern, responsive manga reader built with Next.js that provides an exceptional reading experience for manga enthusiasts.

## 🌐 Live Preview

Check out the live application: [https://weeblook.vercel.app/](https://weeblook.vercel.app/)

## Features

- 🌓 **Dark/Light Theme** - Toggle between dark and light modes
- 📚 **Browse Popular Manga** - Discover trending and popular manga titles
- 🔍 **Advanced Search** - Search with real-time suggestions and filters
- 📖 **Smooth Reading Experience** - Optimized chapter reading with multiple viewing modes
- 🔖 **Bookmarks** - Save your favorite manga for quick access
- 📱 **Responsive Design** - Perfect experience on desktop, tablet, and mobile
- 🎯 **Genre Filtering** - Filter manga by genres and content ratings
- ⚡ **Optimized Performance** - Fast loading with Next.js Image optimization
- 🎨 **Modern UI** - Clean, intuitive interface with blur effects

## Screenshots

### Homepage

- Clean search interface with real-time suggestions
- Featured manga recommendations

### Popular Manga Page

- Grid layout with 4 manga per row on desktop
- Collapsible filter panel with genre and content rating options
- Infinite scroll loading

### Manga Details

- Comprehensive manga information
- Chapter list with pagination for large series
- Bookmark functionality

### Reading Interface

- Multiple reading modes (vertical/horizontal)
- Chapter navigation
- Responsive image loading

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Image Optimization**: Next.js Image component
- **Data Source**: MangaDex API
- **Icons**: Heroicons & custom SVGs

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd weeblook
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
weeblook/
├── app/                          # Next.js App Router pages
│   ├── bookmarks/               # Bookmarks page
│   ├── manga/[id]/             # Manga details page
│   │   └── [chapterNum]/       # Chapter reading page
│   ├── popularmanga/           # Popular manga browsing
│   ├── globals.css             # Global styles
│   ├── layout.js               # Root layout
│   └── page.js                 # Homepage
├── components/                  # Reusable components
│   ├── loading.jsx             # Loading component
│   └── navbar.jsx              # Navigation bar
├── context/                    # React Context providers
│   ├── mangaContext.js         # Manga data management
│   └── themeContext.js         # Theme management
└── public/                     # Static assets
    └── logo.png               # App logo
```

## Features in Detail

### Search Functionality

- Real-time search suggestions
- Debounced input (500ms delay)
- Search results with cover images and descriptions
- Keyboard navigation support

### Filter System

- Genre-based filtering
- Content rating filters (Safe, Suggestive, Erotica, Adult)
- Collapsible filter panel
- Filter persistence with localStorage

### Reading Experience

- Optimized image loading with lazy loading
- Multiple reading modes
- Chapter navigation
- Responsive design for all devices

### Bookmark System

- Local storage-based bookmarks
- Add/remove bookmarks
- Bookmark management page

## API Integration

The app integrates with the MangaDex API to fetch:

- Popular manga listings
- Manga details and metadata
- Chapter information
- Cover images
- Genre/tag information

## Performance Optimizations

- Next.js Image component for optimized image loading
- Lazy loading for manga covers
- Debounced search to reduce API calls
- Chapter pagination for large manga series
- Efficient state management with React Context

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [MangaDex](https://mangadex.org/) for providing the manga data API
- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Heroicons](https://heroicons.com/) for the beautiful icons

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Built with ❤️ for manga lovers everywhere
