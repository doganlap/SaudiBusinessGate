const fs = require('fs');
const path = require('path');

class UIValidator {
  constructor(rootPath = process.cwd()) {
    this.rootPath = rootPath;
    this.results = {
      dependencies: [],
      components: [],
      layout: [],
      errors: []
    };
  }

  async validateUIDependencies() {
    console.log('🔍 Validating UI dependencies...');
    
    const packageJsonPath = path.join(this.rootPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const uiDependencies = [
      'react', 'react-dom', 'next', 'typescript',
      '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select', '@radix-ui/react-tabs',
      'lucide-react', 'tailwindcss', 'clsx', 'class-variance-authority',
      'next-themes', 'framer-motion', '@emotion/react', '@emotion/styled',
      '@mui/material', '@mui/x-data-grid'
    ];

    const validations = [];

    for (const dep of uiDependencies) {
      const exists = this.checkDependencyExists(dep, packageJson);
      const version = this.getDependencyVersion(dep, packageJson);
      
      validations.push({
        name: dep,
        exists: exists,
        version: version,
        status: exists ? 'valid' : 'missing',
        message: exists ? `✅ ${dep} v${version} is installed` : `❌ ${dep} is missing`
      });
    }

    this.results.dependencies = validations;
    return validations;
  }

  async validateComponents() {
    console.log('🔧 Validating UI components...');
    
    const componentPaths = [
      'components/ui/button.tsx',
      'components/ui/card.tsx',
      'components/ui/badge.tsx',
      'components/layout/Header.tsx',
      'components/layout/Sidebar.tsx',
      'components/shell/AppShell.tsx',
      'components/layout/StandardLayout.tsx',
      'components/layout/ContentArea.tsx'
    ];

    const validations = [];

    for (const componentPath of componentPaths) {
      const fullPath = path.join(this.rootPath, componentPath);
      const validation = await this.validateComponent(fullPath, componentPath);
      validations.push(validation);
    }

    this.results.components = validations;
    return validations;
  }

  async validateComponent(fullPath, componentPath) {
    try {
      if (!fs.existsSync(fullPath)) {
        return {
          component: componentPath,
          exists: false,
          imports: [],
          exports: [],
          dependencies: [],
          status: 'missing',
          message: `❌ Component ${componentPath} not found`
        };
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      const imports = this.extractImports(content);
      const exports = this.extractExports(content);
      const dependencies = this.extractDependencies(content);

      return {
        component: componentPath,
        exists: true,
        imports: imports,
        exports: exports,
        dependencies: dependencies,
        status: 'valid',
        message: `✅ Component ${componentPath} is valid`
      };
    } catch (error) {
      return {
        component: componentPath,
        exists: false,
        imports: [],
        exports: [],
        dependencies: [],
        status: 'error',
        message: `❌ Error validating ${componentPath}: ${error}`
      };
    }
  }

  extractImports(content) {
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  extractExports(content) {
    const exportRegex = /export\s+(?:const|function|class|interface|type|default)\s+(\w+)/g;
    const exports = [];
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    return exports;
  }

  extractDependencies(content) {
    const dependencies = [];
    
    // Extract React hooks
    const hookRegex = /use(Effect|State|Context|Memo|Callback|Reducer|Ref)\(/g;
    let match;
    while ((match = hookRegex.exec(content)) !== null) {
      dependencies.push(match[1]);
    }
    
    return dependencies;
  }

  checkDependencyExists(dep, packageJson) {
    return !!(packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]);
  }

  getDependencyVersion(dep, packageJson) {
    return packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep] || 'unknown';
  }

  async validateLayoutStructure() {
    console.log('🏗️ Validating layout structure...');
    
    const layoutStructure = [
      'components/shell/',
      'components/layout/',
      'components/ui/',
      'app/layout.tsx',
      'app/providers.tsx'
    ];

    const validations = [];

    for (const structure of layoutStructure) {
      const fullPath = path.join(this.rootPath, structure);
      const exists = fs.existsSync(fullPath);
      
      validations.push({
        structure: structure,
        exists: exists,
        type: structure.endsWith('/') ? 'directory' : 'file',
        message: exists ? `✅ ${structure} exists` : `❌ ${structure} missing`
      });
    }

    this.results.layout = validations;
    return validations;
  }

  async validateAppShellFramework() {
    console.log('🚀 Validating App Shell Framework...');
    
    const frameworkComponents = [
      'components/shell/AppShell.tsx',
      'components/shell/AppShellContext.tsx',
      'components/shell/index.ts',
      'components/layout/Header.tsx',
      'components/layout/Sidebar.tsx',
      'components/layout/ContentArea.tsx',
      'components/layout/StandardLayout.tsx',
      'components/layout/types.ts'
    ];

    const validations = [];
    let totalComponents = 0;
    let validComponents = 0;

    for (const component of frameworkComponents) {
      const fullPath = path.join(this.rootPath, component);
      const exists = fs.existsSync(fullPath);
      totalComponents++;
      
      if (exists) {
        validComponents++;
        validations.push({
          component: component,
          status: 'valid',
          message: `✅ ${component} implemented`
        });
      } else {
        validations.push({
          component: component,
          status: 'missing',
          message: `❌ ${component} not found`
        });
      }
    }

    const frameworkScore = (validComponents / totalComponents) * 100;
    
    return {
      components: validations,
      score: frameworkScore,
      status: frameworkScore >= 80 ? 'excellent' : 
              frameworkScore >= 60 ? 'good' : 
              frameworkScore >= 40 ? 'fair' : 'needs_improvement',
      message: `App Shell Framework: ${frameworkScore.toFixed(1)}% complete (${validComponents}/${totalComponents} components)`
    };
  }

  async runFullValidation() {
    console.log('🎯 Starting comprehensive UI validation...\n');
    
    try {
      // Validate dependencies
      const dependencies = await this.validateUIDependencies();
      console.log('\n📦 Dependency Validation Results:');
      dependencies.forEach(dep => console.log(`  ${dep.message}`));
      
      // Validate components
      const components = await this.validateComponents();
      console.log('\n🔧 Component Validation Results:');
      components.forEach(comp => console.log(`  ${comp.message}`));
      
      // Validate layout structure
      const layout = await this.validateLayoutStructure();
      console.log('\n🏗️ Layout Structure Validation:');
      layout.forEach(item => console.log(`  ${item.message}`));
      
      // Validate app shell framework
      const framework = await this.validateAppShellFramework();
      console.log('\n🚀 App Shell Framework Validation:');
      console.log(`  ${framework.message}`);
      
      // Generate summary
      const summary = this.generateSummary(dependencies, components, layout, framework);
      console.log('\n📊 Validation Summary:');
      console.log(summary);
      
      return {
        dependencies: dependencies,
        components: components,
        layout: layout,
        framework: framework,
        summary: summary,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('\n❌ Validation failed:', error);
      this.results.errors.push(error.toString());
      throw error;
    }
  }

  generateSummary(dependencies, components, layout, framework) {
    const totalDeps = dependencies.length;
    const validDeps = dependencies.filter(d => d.status === 'valid').length;
    const totalComps = components.length;
    const validComps = components.filter(c => c.status === 'valid').length;
    const totalLayout = layout.length;
    const validLayout = layout.filter(l => l.exists).length;
    
    const depScore = (validDeps / totalDeps) * 100;
    const compScore = (validComps / totalComps) * 100;
    const layoutScore = (validLayout / totalLayout) * 100;
    
    return `
🎯 UI Validation Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Dependencies: ${validDeps}/${totalDeps} (${depScore.toFixed(1)}%)
🔧 Components: ${validComps}/${totalComps} (${compScore.toFixed(1)}%)
🏗️ Layout Structure: ${validLayout}/${totalLayout} (${layoutScore.toFixed(1)}%)
🚀 App Shell Framework: ${framework.score.toFixed(1)}%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Status: ${this.getOverallStatus(depScore, compScore, layoutScore, framework.score)}
`;
  }

  getOverallStatus(...scores) {
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    if (avgScore >= 90) return '🟢 Excellent - All systems ready!';
    if (avgScore >= 80) return '🟡 Good - Minor improvements needed';
    if (avgScore >= 70) return '🟠 Fair - Some issues to address';
    if (avgScore >= 60) return '🔴 Needs Improvement - Significant issues';
    return '⚠️ Critical - Major issues require immediate attention';
  }

  getResults() {
    return this.results;
  }
}

// CLI execution
if (require.main === module) {
  const validator = new UIValidator();
  validator.runFullValidation()
    .then(results => {
      console.log('\n✅ Validation completed successfully!');
      
      // Save results to file
      const resultsPath = path.join(process.cwd(), 'ui-validation-results.json');
      fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
      console.log(`\n📄 Results saved to: ${resultsPath}`);
      
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Validation failed:', error);
      process.exit(1);
    });
}

module.exports = UIValidator;