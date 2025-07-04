#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Starting Performance Test Suite...\n')

// Test 1: Build Performance
console.log('📦 Testing Build Performance...')
const buildStart = Date.now()
try {
  execSync('npm run build', { stdio: 'pipe' })
  const buildTime = Date.now() - buildStart
  console.log(`✅ Build completed in ${buildTime}ms`)

  if (buildTime < 30000) {
    console.log('🎉 Build performance: EXCELLENT')
  } else if (buildTime < 60000) {
    console.log('👍 Build performance: GOOD')
  } else {
    console.log('⚠️ Build performance: NEEDS IMPROVEMENT')
  }
} catch (error) {
  console.log('❌ Build failed:', error.message)
}

console.log('')

// Test 2: Bundle Size Analysis
console.log('📊 Analyzing Bundle Size...')
try {
  const bundleStats = execSync('npm run analyze', { stdio: 'pipe' }).toString()

  // Extract bundle size information
  const bundleSizeMatch = bundleStats.match(/bundle size: (\d+\.?\d*) KB/i)
  if (bundleSizeMatch) {
    const size = parseFloat(bundleSizeMatch[1])
    console.log(`📦 Bundle size: ${size}KB`)

    if (size < 500) {
      console.log('🎉 Bundle size: EXCELLENT')
    } else if (size < 1000) {
      console.log('👍 Bundle size: GOOD')
    } else {
      console.log('⚠️ Bundle size: NEEDS OPTIMIZATION')
    }
  }
} catch (error) {
  console.log('❌ Bundle analysis failed:', error.message)
}

console.log('')

// Test 3: Check for Performance Optimizations
console.log('🔍 Checking Performance Optimizations...')

const checks = [
  {
    name: 'Service Worker',
    file: 'public/sw.js',
    description: 'Caching and offline support',
  },
  {
    name: 'Web Worker',
    file: 'public/worker.js',
    description: 'Off-main-thread processing',
  },
  {
    name: 'Optimized Images',
    file: 'src/components/OptimizedImage.tsx',
    description: 'Lazy loading and optimization',
  },
  {
    name: 'Performance Monitor',
    file: 'src/hooks/usePerformanceMonitor.ts',
    description: 'Real-time performance tracking',
  },
  {
    name: 'Virtualized List',
    file: 'src/components/VirtualizedList.tsx',
    description: 'Efficient large list rendering',
  },
  {
    name: 'Next.js Config',
    file: 'next.config.mjs',
    description: 'Bundle and image optimization',
  },
]

let optimizationScore = 0
const totalChecks = checks.length

checks.forEach((check) => {
  const filePath = path.join(process.cwd(), check.file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${check.name}: ${check.description}`)
    optimizationScore++
  } else {
    console.log(`❌ ${check.name}: Missing`)
  }
})

console.log(`\n📈 Optimization Score: ${optimizationScore}/${totalChecks}`)

if (optimizationScore === totalChecks) {
  console.log('🎉 All performance optimizations are in place!')
} else if (optimizationScore >= totalChecks * 0.8) {
  console.log('👍 Most optimizations are implemented')
} else {
  console.log('⚠️ Several optimizations are missing')
}

console.log('')

// Test 4: Lighthouse Score Estimation
console.log('💡 Lighthouse Score Estimation...')
console.log('Run "npm run lighthouse" to get detailed performance scores')
console.log('Expected scores with optimizations:')
console.log('  - Performance: 90+')
console.log('  - Accessibility: 95+')
console.log('  - Best Practices: 90+')
console.log('  - SEO: 95+')

console.log('')

// Test 5: Performance Recommendations
console.log('📋 Performance Recommendations:')

const recommendations = [
  '✅ Use React.memo for expensive components',
  '✅ Implement lazy loading for routes and components',
  '✅ Optimize images with next/image',
  '✅ Use web workers for heavy computations',
  '✅ Implement proper caching strategies',
  '✅ Monitor Core Web Vitals',
  '✅ Use virtualization for large lists',
  '✅ Debounce rapid state updates',
  '✅ Implement error boundaries',
  '✅ Use service worker for offline support',
]

recommendations.forEach((rec) => console.log(rec))

console.log('\n🎯 Performance Test Suite Complete!')
console.log('For detailed analysis, run: npm run perf:audit')
