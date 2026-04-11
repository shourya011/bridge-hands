# Bridge Hands - Libraries and Dependencies Explained

This document provides a comprehensive overview of all libraries and dependencies used in the Bridge Hands project, including their purpose, usage, and key features.

---

## Table of Contents

1. [Core Framework](#core-framework)
2. [UI Component Library](#ui-component-library)
3. [State Management & Data Fetching](#state-management--data-fetching)
4. [Form & Validation](#form--validation)
5. [Machine Learning & Vision](#machine-learning--vision)
6. [Styling & Theming](#styling--theming)
7. [Routing](#routing)
8. [Media & Video](#media--video)
9. [Data Visualization](#data-visualization)
10. [Utilities & Helpers](#utilities--helpers)
11. [Development Tools](#development-tools)

---

## Core Framework

### React (^18.3.1)
**Purpose:** JavaScript library for building user interfaces with component-based architecture.

```tsx
import React from 'react';

const App = () => {
  return <div>Hello World</div>;
};

export default App;
```

**Usage in Project:**
- Build reusable UI components
- Manage component state and lifecycle
- Create interactive pages (Home, Translate, Integrations)

**Key Features:**
- Functional components with hooks
- Virtual DOM for efficient rendering
- Component composition and reusability

---

### React DOM (^18.3.1)
**Purpose:** Provides DOM-specific methods for React applications.

```tsx
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

**Usage in Project:**
- Renders React components into the DOM
- Bridges React components and browser DOM

---

## UI Component Library

### shadcn/ui (Radix UI Components)
**Purpose:** A collection of high-quality, unstyled, accessible components built on Radix UI primitives.

**Installed Components:**

```tsx
// Multiple Radix UI components included:
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
```

**Available Components:**
- `accordion` - Collapsible content sections
- `alert-dialog` - Confirmation dialogs
- `alert` - Alert notifications
- `aspect-ratio` - Maintains aspect ratio
- `avatar` - User profile images
- `badge` - Labels and tags
- `breadcrumb` - Navigation path
- `button` - Interactive buttons
- `calendar` - Date picker calendar
- `card` - Content containers
- `carousel` - Image/content carousel
- `chart` - Data visualization
- `checkbox` - Toggle checkboxes
- `collapsible` - Expandable sections
- `command` - Command palette
- `context-menu` - Right-click menus
- `dialog` - Modal dialogs
- `drawer` - Slide-in panels
- `dropdown-menu` - Dropdown selections
- `hover-card` - Hover information
- `label` - Form labels
- `menubar` - Application menu
- `navigation-menu` - Navigation bars
- `popover` - Pop-up content
- `progress` - Progress indicators
- `radio-group` - Radio button groups
- `scroll-area` - Scrollable areas
- `select` - Dropdown selectors
- `separator` - Visual dividers
- `slider` - Range sliders
- `switch` - Toggle switches
- `tabs` - Tab navigation
- `toast` - Notifications
- `toggle` - Toggle buttons
- `toggle-group` - Grouped toggles
- `tooltip` - Hover tooltips

**Usage Example:**
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function Dashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Recognition</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Start Training</Button>
      </CardContent>
    </Card>
  );
}
```

---

### Lucide React (^0.462.0)
**Purpose:** Beautiful and consistent icon library for React applications.

```tsx
import { Camera, Hand, Volume2, Settings } from 'lucide-react';

export function IconExample() {
  return (
    <>
      <Camera className="w-6 h-6" />
      <Hand className="w-6 h-6" />
      <Volume2 className="w-6 h-6" />
      <Settings className="w-6 h-6" />
    </>
  );
}
```

**Usage in Project:**
- Navigation icons
- Feature indicators
- Action buttons
- Status indicators

---

## State Management & Data Fetching

### TanStack React Query (^5.83.0)
**Purpose:** Powerful asynchronous state management library for handling server state, caching, and synchronization.

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';

// Query example
function UserProfile() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: () => fetch('/api/user').then(r => r.json()),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{data.name}</div>;
}

// Mutation example
function CreateGesture() {
  const mutation = useMutation({
    mutationFn: (newGesture) => 
      fetch('/api/gestures', { method: 'POST', body: JSON.stringify(newGesture) }),
  });

  return <button onClick={() => mutation.mutate({ name: 'Wave' })}>Create</button>;
}
```

**Key Features:**
- Automatic caching and synchronization
- Background refetching
- Request deduplication
- Infinite queries support
- Optimistic updates

**Usage in Project:**
- Fetch training data
- Cache gesture recognition results
- Manage translation API calls
- Handle gesture database synchronization

---

## Form & Validation

### React Hook Form (^7.61.1)
**Purpose:** Performant, flexible, and extensible forms with easy-to-use validation.

```tsx
import { useForm } from 'react-hook-form';

function GestureForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input 
        {...register('gestureName', { required: 'Name is required' })} 
      />
      {errors.gestureName && <span>{errors.gestureName.message}</span>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

**Key Features:**
- Minimal re-renders
- Simple validation
- Small bundle size
- TypeScript support

---

### @hookform/resolvers (^3.10.0)
**Purpose:** Validation library resolvers for React Hook Form.

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function LoginForm() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <input {...register('email')} />
      <input {...register('password')} />
      <button type="submit">Login</button>
    </form>
  );
}
```

---

### Zod (^3.25.76)
**Purpose:** TypeScript-first schema validation with static type inference.

```typescript
import { z } from 'zod';

// Define schema
const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(0).max(120),
  gestures: z.array(z.string()),
});

// Type inference
type User = z.infer<typeof UserSchema>;

// Validate data
const result = UserSchema.parse({
  name: 'John',
  email: 'john@example.com',
  age: 30,
  gestures: ['wave', 'thumbsup'],
});

// Safe parsing
const safeResult = UserSchema.safeParse(data);
if (safeResult.success) {
  console.log(safeResult.data);
} else {
  console.log(safeResult.error);
}
```

**Usage in Project:**
- Validate gesture training data
- Validate form inputs
- Validate API responses
- Type-safe data structures

---

## Machine Learning & Vision

### MediaPipe Tasks Vision (^0.10.22-rc.20250304)
**Purpose:** Google's MediaPipe library for computer vision tasks including hand detection and pose estimation.

```typescript
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let handLandmarker: HandLandmarker;

async function initHandDetection() {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );
  
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker.task'
    },
    numHands: 2,
    runningMode: 'VIDEO',
  });
}

// Detect hand landmarks in video
function detectHands(video: HTMLVideoElement) {
  const results = handLandmarker.detectForVideo(video, performance.now());
  return results.landmarks; // 21 hand landmarks per hand
}
```

**Key Features:**
- Real-time hand detection
- 21 hand landmarks per detected hand
- Multi-hand detection
- High accuracy and performance
- WebGL acceleration support

**Usage in Project:**
- Capture hand gestures from webcam
- Extract hand landmarks for gesture recognition
- Used in `WebcamCapture.tsx` component
- Foundation for gesture training system

---

### TensorFlow.js (^4.22.0)
**Purpose:** JavaScript library for machine learning, enabling browser-based ML model inference and training.

```typescript
import * as tf from '@tensorflow/tfjs';

// Create a simple model
const model = tf.sequential({
  layers: [
    tf.layers.dense({ units: 32, activation: 'relu', inputShape: [21 * 3] }),
    tf.layers.dropout({ rate: 0.2 }),
    tf.layers.dense({ units: 16, activation: 'relu' }),
    tf.layers.dense({ units: numGestures, activation: 'softmax' })
  ]
});

// Compile model
model.compile({
  optimizer: 'adam',
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy']
});

// Train model with gesture landmarks
async function trainModel(data: tf.TensorContainerObject) {
  await model.fit(data.x, data.y, {
    epochs: 50,
    batchSize: 32,
    validationSplit: 0.2,
  });
}

// Make predictions
function predictGesture(landmarks: number[]) {
  const input = tf.tensor2d([landmarks]);
  const prediction = model.predict(input);
  return prediction.dataSync();
}
```

**Usage in Project:**
- Train custom gesture recognition models
- Real-time gesture classification
- In-browser model inference
- Save and load trained models
- Used in `trainedGestureRecognizer.ts`

---

## Styling & Theming

### Tailwind CSS (^3.4.17)
**Purpose:** Utility-first CSS framework for rapidly building custom designs.

```tsx
// In your React components:
export function Card() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Title</h2>
      <p className="text-gray-600 leading-relaxed">Content</p>
    </div>
  );
}
```

**CSS Example:**
```css
/* tailwind.config.ts */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#007AFF',
      },
      spacing: {
        '128': '32rem',
      }
    }
  }
}
```

**Key Features:**
- Utility-first approach
- Dark mode support
- Responsive design utilities
- Easy customization
- Small bundle size

---

### Class Variance Authority (^0.7.1)
**Purpose:** Create component-scoped styling patterns with TypeScript support.

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "px-4 py-2 rounded-md font-semibold transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
        danger: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "text-sm px-2 py-1",
        md: "text-base px-4 py-2",
        lg: "text-lg px-6 py-3",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
}

export function Button({ variant, size, children }: ButtonProps) {
  return <button className={buttonVariants({ variant, size })}>{children}</button>;
}

// Usage:
<Button variant="danger" size="lg">Delete</Button>
```

---

### Tailwind Merge (^2.6.0)
**Purpose:** Efficiently merge Tailwind CSS classes and resolve conflicts.

```tsx
import { twMerge } from 'tailwind-merge';

function CustomButton({ className, ...props }) {
  return (
    <button
      className={twMerge('px-4 py-2 bg-blue-500', className)}
      {...props}
    />
  );
}

// Usage:
<CustomButton className="bg-red-500" /> // bg-red-500 takes precedence
```

---

### tailwindcss-animate (^1.0.7)
**Purpose:** Adds smooth animation utilities to Tailwind CSS.

```tsx
// In your HTML/TSX:
<div className="animate-fade-in animate-spin">Loading...</div>

// Custom animations in tailwind.config.ts:
export default {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        }
      }
    }
  }
}
```

---

### next-themes (^0.3.0)
**Purpose:** Manage theme switching and persistence in Next.js applications (works with React too).

```tsx
import { ThemeProvider, useTheme } from 'next-themes';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <YourApp />
    </ThemeProvider>
  );
}

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

**Features:**
- Dark/light mode switching
- System preference detection
- Persistent theme storage
- SSR support

---

### PostCSS (^8.5.6)
**Purpose:** Tool for transforming CSS with JavaScript plugins.

```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Usage:**
- Applies vendor prefixes automatically
- Enables Tailwind CSS processing
- Transform CSS with plugins

---

### Autoprefixer (^10.4.21)
**Purpose:** PostCSS plugin to parse CSS and add vendor prefixes automatically.

```css
/* Input */
display: flex;
user-select: none;

/* Output */
display: -webkit-flex;
display: -ms-flexbox;
display: flex;
-webkit-user-select: none;
-moz-user-select: none;
-ms-user-select: none;
user-select: none;
```

---

## Routing

### React Router DOM (^6.30.1)
**Purpose:** Complete routing library for React applications with declarative routing.

```tsx
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Translate from './pages/Translate';
import NotFound from './pages/NotFound';

// Main routing setup in App.tsx
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/translate" element={<Translate />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

// Navigation
function NavBar() {
  const navigate = useNavigate();

  return (
    <>
      <Link to="/">Home</Link>
      <Link to="/translate">Translate</Link>
      <button onClick={() => navigate('/')}>Go Home</button>
    </>
  );
}
```

**Usage in Project:**
- Navigate between pages (Home, Translate, Integrations, Accessibility, About)
- Handle 404 error pages
- Deep linking support

---

## Media & Video

### React Webcam (^7.2.0)
**Purpose:** React component for accessing webcam stream using getUserMedia API.

```tsx
import Webcam from 'react-webcam';
import { useRef } from 'react';

function WebcamComponent() {
  const webcamRef = useRef<Webcam>(null);

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    console.log(imageSrc); // Base64 image data
  };

  return (
    <>
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          width: 1280,
          height: 720,
          facingMode: 'user'
        }}
      />
      <button onClick={capture}>Capture</button>
    </>
  );
}
```

**Usage in Project:**
- Capture hand gestures from webcam
- Real-time video stream processing
- Main component in `WebcamCapture.tsx`
- Gesture training and recognition

---

## Data Visualization

### Recharts (^2.15.4)
**Purpose:** Composable charting library built on React components for data visualization.

```tsx
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const data = [
  { name: 'Jan', accuracy: 65, confidence: 45 },
  { name: 'Feb', accuracy: 75, confidence: 55 },
  { name: 'Mar', accuracy: 85, confidence: 70 },
];

export function PerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="accuracy" stroke="#8884d8" />
        <Line type="monotone" dataKey="confidence" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

**Usage in Project:**
- Visualize gesture recognition accuracy
- Display training progress
- Show performance metrics
- Interactive data exploration

---

## Utilities & Helpers

### CLSX (^2.1.1)
**Purpose:** Tiny utility for constructing conditional className strings.

```tsx
import clsx from 'clsx';

function Button({ isActive, isDisabled, variant }) {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded',
        {
          'bg-blue-600 text-white': !isDisabled && variant === 'primary',
          'bg-gray-200 text-gray-400': isDisabled,
          'ring-2 ring-blue-300': isActive,
        }
      )}
      disabled={isDisabled}
    >
      Click me
    </button>
  );
}
```

---

### date-fns (^3.6.0)
**Purpose:** Modern date utility library for manipulating, formatting, and parsing dates.

```typescript
import {
  format,
  parseISO,
  addDays,
  startOfMonth,
  endOfMonth,
  differenceInDays,
  isAfter,
  isBefore
} from 'date-fns';

// Format dates
const formatted = format(new Date(), 'MMM dd, yyyy'); // "Jan 15, 2026"

// Parse dates
const parsed = parseISO('2026-01-15');

// Manipulate dates
const tomorrow = addDays(new Date(), 1);
const startMonth = startOfMonth(new Date());
const endMonth = endOfMonth(new Date());

// Compare dates
const daysDiff = differenceInDays(new Date('2026-02-01'), new Date('2026-01-01')); // 31

// Validate dates
console.log(isAfter(new Date('2026-02-01'), new Date('2026-01-01'))); // true
```

**Usage in Project:**
- Format training session timestamps
- Calculate gesture practice duration
- Track performance over time

---

### input-otp (^1.4.2)
**Purpose:** Headless React component for building OTP (One-Time Password) inputs.

```tsx
import { OTPInput, SlotProps } from 'input-otp';

function OTPForm() {
  return (
    <OTPInput maxLength={6} containerClassName="flex gap-2" onChange={(value) => console.log(value)}>
      <input placeholder="-" />
      <input placeholder="-" />
      <input placeholder="-" />
      <input placeholder="-" />
      <input placeholder="-" />
      <input placeholder="-" />
    </OTPInput>
  );
}
```

---

### Sonner (^1.7.4)
**Purpose:** Modern, simple, and beautiful toast notification library for React.

```tsx
import { Toaster, toast } from 'sonner';

export function App() {
  return (
    <>
      <Toaster />
      <button onClick={() => toast.success('Gesture saved!')}>
        Save Gesture
      </button>
      <button onClick={() => toast.error('Recognition failed!')}>
        Error Example
      </button>
    </>
  );
}

// Different toast types
toast.success('Success message');
toast.error('Error message');
toast.loading('Loading...');
toast.promise(promise, {
  loading: 'Loading...',
  success: 'Done!',
  error: 'Error!'
});
```

**Usage in Project:**
- Notify users of gesture recognition success/failure
- Show training session updates
- Display error messages
- Feedback on user actions

---

### Vaul (^0.9.9)
**Purpose:** React drawer/modal component built with Radix UI for smooth animations.

```tsx
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export function GestureDrawer() {
  return (
    <Drawer>
      <DrawerTrigger>Open Drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Gesture Settings</DrawerTitle>
          <DrawerDescription>Adjust gesture recognition settings</DrawerDescription>
        </DrawerHeader>
        <DrawerClose>Close</DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}
```

---

### CMDk (^1.1.1)
**Purpose:** Fast command menu component for React with keyboard shortcuts and search.

```tsx
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function CommandMenu() {
  return (
    <Command>
      <CommandInput placeholder="Search gestures..." />
      <CommandList>
        <CommandEmpty>No gestures found.</CommandEmpty>
        <CommandGroup heading="Gestures">
          <CommandItem>Wave</CommandItem>
          <CommandItem>Thumbs Up</CommandItem>
          <CommandItem>Point</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
```

---

### Embla Carousel React (^8.6.0)
**Purpose:** Headless carousel library for building custom carousel components.

```tsx
import useEmblaCarousel from 'embla-carousel-react';

function Carousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  return (
    <div className="embla" ref={emblaRef}>
      <div className="embla__container">
        <div className="embla__slide">Slide 1</div>
        <div className="embla__slide">Slide 2</div>
        <div className="embla__slide">Slide 3</div>
      </div>
    </div>
  );
}
```

---

### React Day Picker (^8.10.1)
**Purpose:** Flexible date picker component for React without external dependencies.

```tsx
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export function DatePickerExample() {
  const [selected, setSelected] = React.useState<Date>();

  return <DayPicker mode="single" selected={selected} onSelect={setSelected} />;
}
```

---

### React Resizable Panels (^2.1.9)
**Purpose:** Resizable panel layout components for building flexible dashboards and splits.

```tsx
import { PanelGroup, Panel, PanelResizer } from 'react-resizable-panels';

function Dashboard() {
  return (
    <PanelGroup direction="horizontal">
      <Panel defaultSize={50}>
        <div>Left Panel</div>
      </Panel>
      <PanelResizer />
      <Panel defaultSize={50}>
        <div>Right Panel</div>
      </Panel>
    </PanelGroup>
  );
}
```

---

## Development Tools

### Vite (^5.4.19)
**Purpose:** Next-generation frontend build tool with instant module replacement and lightning-fast build times.

```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  }
});
```

**Scripts:**
```json
{
  "dev": "vite",                    // Start dev server
  "build": "vite build",            // Production build
  "preview": "vite preview"         // Preview prod build
}
```

---

### TypeScript (^5.8.3)
**Purpose:** Typed superset of JavaScript for building type-safe applications.

```typescript
// Basic types
interface GestureData {
  name: string;
  confidence: number;
  landmarks: Array<{ x: number; y: number; z: number }>;
}

// Function typing
function recognizeGesture(data: GestureData): string {
  if (data.confidence > 0.7) {
    return data.name;
  }
  return 'Unknown';
}

// Generic types
function processGestures<T extends GestureData>(gestures: T[]): T[] {
  return gestures.filter(g => g.confidence > 0.6);
}
```

**Config (tsconfig.json):**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### @vitejs/plugin-react-swc (^3.11.0)
**Purpose:** Vite plugin for React using SWC (Speedy Web Compiler) for faster builds.

```javascript
// Included in vite.config.ts
import react from '@vitejs/plugin-react-swc';

export default {
  plugins: [react()],
};
```

**Benefits:**
- 20x faster than Babel
- Faster hot module replacement
- Smaller bundle size

---

### ESLint (^9.32.0)
**Purpose:** JavaScript linter for identifying and fixing problematic patterns.

```javascript
// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
    },
  },
];
```

**Usage:**
```bash
npm run lint
```

---

### typescript-eslint (^8.38.0)
**Purpose:** ESLint plugin for TypeScript code analysis and linting.

```javascript
import tseslint from 'typescript-eslint';

export default [
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-types': 'off',
    },
  },
];
```

---

### ESLint Plugin React Hooks (^5.2.0)
**Purpose:** ESLint plugin for React Hooks best practices.

```javascript
export default [
  {
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
```

---

### ESLint Plugin React Refresh (^0.4.20)
**Purpose:** ESLint plugin for fast refresh support and best practices.

---

### Lovable Tagger (^1.1.11)
**Purpose:** Development utility for tagging and identifying components.

---

## Summary: Architecture Overview

```
┌─────────────────────────────────────────────────┐
│          Bridge Hands Application                │
├─────────────────────────────────────────────────┤
│  Frontend UI Layer (React + Tailwind CSS)       │
│  ├── Components (shadcn/ui + Radix UI)         │
│  ├── Pages (Home, Translate, Integrations)     │
│  └── Icons (Lucide React)                       │
├─────────────────────────────────────────────────┤
│  State Management & Data Fetching                │
│  ├── TanStack React Query (Server State)        │
│  ├── React Hook Form (Form State)               │
│  └── Zod (Validation)                           │
├─────────────────────────────────────────────────┤
│  Vision & ML Processing                         │
│  ├── MediaPipe (Hand Detection)                 │
│  ├── TensorFlow.js (Model Training/Inference)  │
│  └── React Webcam (Video Input)                 │
├─────────────────────────────────────────────────┤
│  Routing & Navigation                           │
│  └── React Router DOM                           │
├─────────────────────────────────────────────────┤
│  Data Visualization                              │
│  ├── Recharts (Charts)                          │
│  └── Custom Visualizations                      │
├─────────────────────────────────────────────────┤
│  Utilities & Animations                          │
│  ├── date-fns (Date Handling)                   │
│  ├── CLSX (Class Utilities)                     │
│  ├── Sonner (Toast Notifications)               │
│  └── Tailwind Animate (Animations)              │
├─────────────────────────────────────────────────┤
│  Build & Development                             │
│  ├── Vite (Build Tool)                          │
│  ├── TypeScript (Type Safety)                   │
│  ├── ESLint (Code Quality)                      │
│  └── Tailwind CSS (Styling)                     │
└─────────────────────────────────────────────────┘
```

## Key Dependencies by Responsibility

| **Responsibility** | **Libraries** |
|---|---|
| **User Interface** | React, React DOM, shadcn/ui, Radix UI, Lucide React |
| **Styling** | Tailwind CSS, tailwind-merge, CVA, tailwindcss-animate, PostCSS |
| **Routing** | React Router DOM |
| **State & Data** | TanStack Query, React Hook Form, Zod |
| **Vision/ML** | MediaPipe Vision, TensorFlow.js, React Webcam |
| **Visualization** | Recharts |
| **Utilities** | date-fns, CLSX, Sonner, Vaul, CMDk |
| **Theming** | next-themes |
| **Build & Dev** | Vite, TypeScript, ESLint, SWC |

---

## Installation & Setup

```bash
# Install all dependencies
npm install
# or
bun install

# Development server
npm run dev

# Production build
npm run build

# Linting
npm run lint

# Preview production build
npm run preview
```

---

## Performance Considerations

1. **Tree Shaking:** Vite and modern bundlers automatically remove unused code
2. **Code Splitting:** React Router enables automatic route-based code splitting
3. **Image Optimization:** Tailwind CSS utilities for responsive images
4. **Caching:** React Query provides intelligent caching strategies
5. **ML Model Optimization:** TensorFlow.js supports quantization and pruning
6. **Bundle Size:** Most libraries are optimized for minimal overhead

---

This document provides a comprehensive guide to understanding and working with the Bridge Hands project's technology stack.
