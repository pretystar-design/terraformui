import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const en = {
  translation: {
    // Toolbar
    'toolbar.title': 'Terraform Visual',
    'toolbar.undo': 'Undo',
    'toolbar.redo': 'Redo',
    'toolbar.export': 'Export',
    'toolbar.export.tf': 'Export as .tf',
    'toolbar.export.zip': 'Export as ZIP',
    'toolbar.validate': 'Validate',
    'toolbar.plan': 'Plan',
    'toolbar.import': 'Import',
    'toolbar.import.tfstate': 'Import tfstate',
    'toolbar.save': 'Save',
    'toolbar.projects': 'Projects',

    // Sidebar
    'sidebar.search': 'Search resources...',
    'sidebar.aws': 'AWS',
    'sidebar.azure': 'Azure',
    'sidebar.gcp': 'GCP',
    'sidebar.modules': 'Modules',
    'sidebar.favorites': 'Favorites',

    // Property Panel
    'property.title': 'Properties',
    'property.required': 'Required',
    'property.optional': 'Optional',
    'property.no-selection': 'Select a node to edit properties',
    'property.delete': 'Delete Node',
    'property.duplicate': 'Duplicate',

    // Preview
    'preview.title': 'HCL Preview',
    'preview.copy': 'Copy to Clipboard',
    'preview.copied': 'Copied!',
    'preview.empty': 'Add nodes to generate HCL',

    // Validation
    'validation.errors': 'Validation Errors',
    'validation.warnings': 'Warnings',
    'validation.valid': 'Configuration is valid',
    'validation.running': 'Running validation...',

    // Import
    'import.title': 'Import Infrastructure',
    'import.drop': 'Drop tfstate file here',
    'import.browse': 'or browse',
    'import.success': 'Imported {{count}} resources',

    // Project
    'project.new': 'New Project',
    'project.save': 'Save Project',
    'project.saved': 'Saved',
    'project.unsaved': 'Unsaved changes',
    'project.saving': 'Saving...',

    // Common
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.error': 'Error',
  },
}

const zh = {
  translation: {
    // Toolbar
    'toolbar.title': 'Terraform 可视化',
    'toolbar.undo': '撤销',
    'toolbar.redo': '重做',
    'toolbar.export': '导出',
    'toolbar.export.tf': '导出为 .tf',
    'toolbar.export.zip': '导出为 ZIP',
    'toolbar.validate': '验证',
    'toolbar.plan': '计划',
    'toolbar.import': '导入',
    'toolbar.import.tfstate': '导入 tfstate',
    'toolbar.save': '保存',
    'toolbar.projects': '项目',

    // Sidebar
    'sidebar.search': '搜索资源...',
    'sidebar.aws': 'AWS',
    'sidebar.azure': 'Azure',
    'sidebar.gcp': 'GCP',
    'sidebar.modules': '模块',
    'sidebar.favorites': '收藏',

    // Property Panel
    'property.title': '属性',
    'property.required': '必填',
    'property.optional': '可选',
    'property.no-selection': '选择节点以编辑属性',
    'property.delete': '删除节点',
    'property.duplicate': '复制',

    // Preview
    'preview.title': 'HCL 预览',
    'preview.copy': '复制到剪贴板',
    'preview.copied': '已复制！',
    'preview.empty': '添加节点以生成 HCL',

    // Validation
    'validation.errors': '验证错误',
    'validation.warnings': '警告',
    'validation.valid': '配置有效',
    'validation.running': '正在验证...',

    // Import
    'import.title': '导入基础设施',
    'import.drop': '拖放 tfstate 文件到此处',
    'import.browse': '或浏览文件',
    'import.success': '已导入 {{count}} 个资源',

    // Project
    'project.new': '新建项目',
    'project.save': '保存项目',
    'project.saved': '已保存',
    'project.unsaved': '未保存的更改',
    'project.saving': '保存中...',

    // Common
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.delete': '删除',
    'common.close': '关闭',
    'common.loading': '加载中...',
    'common.error': '错误',
  },
}

i18n.use(initReactI18next).init({
  resources: { en, zh },
  lng: localStorage.getItem('tvg-language') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('tvg-language', lng)
})

export default i18n
