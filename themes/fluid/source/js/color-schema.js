/**
 * Modify by https://blog.skk.moe/post/hello-darkmode-my-old-friend/
 */
// eslint-disable-next-line no-unused-expressions
!(function (window, document) {
  var rootElement = document.documentElement;
  var colorSchemaStorageKey = 'Fluid_Color_Scheme';
  var colorSchemaMediaQueryKey = '--color-mode';
  var userColorSchemaAttributeName = 'data-user-color-scheme';
  var defaultColorSchemaAttributeName = 'data-default-color-scheme';
  var colorToggleButtonName = 'color-toggle-btn';
  var colorToggleIconName = 'color-toggle-icon';

  function setLS(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch (e) { }
  }

  function removeLS(k) {
    try {
      localStorage.removeItem(k);
    } catch (e) { }
  }

  function getLS(k) {
    try {
      return localStorage.getItem(k);
    } catch (e) {
      return null;
    }
  }

  function getModeFromCSSMediaQuery() {
    var res = getComputedStyle(rootElement).getPropertyValue(
      colorSchemaMediaQueryKey
    );
    if (res.length > 0) {
      return res.replace(/["'\s]/g, '');
    }
    return null;
  }

  function resetRootColorSchemaAttributeAndLS() {
    rootElement.removeAttribute(userColorSchemaAttributeName);
    removeLS(colorSchemaStorageKey);
  }

  var validColorSchemaKeys = {
    dark: true,
    light: true
  };

  function getDefaultColorSchemaAttribute() {
    // 取默认字段的值
    var schema = rootElement.getAttribute(defaultColorSchemaAttributeName);
    // 如果明确指定了 schema 则返回
    if (validColorSchemaKeys[schema]) {
      return schema;
    }
    // 默认优先按 prefers-color-scheme
    schema = getModeFromCSSMediaQuery();
    if (validColorSchemaKeys[schema]) {
      return schema;
    }
    // 否则按本地时间是否大于 18 点
    if (new Date().getHours() >= 18) {
      return 'dark';
    }
    return 'light';
  }

  function applyCustomColorSchemaSettings(schema) {
    // 接受从「开关」处传来的模式，或者从 localStorage 读取，否则按默认设置值
    var currentSetting = schema || getLS(colorSchemaStorageKey) || getDefaultColorSchemaAttribute();

    if (currentSetting === getModeFromCSSMediaQuery()) {
      // 当用户自定义的显示模式和 prefers-color-scheme 相同时，重置到自动模式
      resetRootColorSchemaAttributeAndLS();
    } else if (validColorSchemaKeys[currentSetting]) {
      rootElement.setAttribute(
        userColorSchemaAttributeName,
        currentSetting
      );
    } else {
      // 首次访问或从未使用过开关、localStorage 中没有存储的值，currentSetting 是 null
      // 或者 localStorage 被篡改，currentSetting 不是合法值
      resetRootColorSchemaAttributeAndLS();
    }

    // 根据当前模式设置图标
    setButtonIcon(currentSetting);
    //自定义暗色模式，settimeout是保证将其踢到DOM末尾避免底下没加载

    setTimeout(() => {
      try {
        setCustom(currentSetting)
      } catch (n) { }
    }, 0)

  }

  var invertColorSchemaObj = {
    dark: 'light',
    light: 'dark'
  };

  function toggleCustomColorSchema() {
    var currentSetting = getLS(colorSchemaStorageKey);

    if (validColorSchemaKeys[currentSetting]) {
      // 从 localStorage 中读取模式，并取相反的模式
      currentSetting = invertColorSchemaObj[currentSetting];
    } else if (currentSetting === null) {
      // localStorage 中没有相关值，或者 localStorage 抛了 Error
      // 从 CSS 中读取当前 prefers-color-scheme 并取相反的模式
      currentSetting = invertColorSchemaObj[getModeFromCSSMediaQuery()];
    } else {
      return;
    }
    // 将相反的模式写入 localStorage
    setLS(colorSchemaStorageKey, currentSetting);

    return currentSetting;
  }

  function setButtonIcon(schema) {
    if (validColorSchemaKeys[schema]) {
      // 切换图标
      var icon = 'icon-dark';
      if (schema) {
        icon = 'icon-' + invertColorSchemaObj[schema];
      }
      var iconElement = document.getElementById(colorToggleIconName);
      if (iconElement) {
        iconElement.setAttribute(
          'class',
          'iconfont ' + icon
        );
      } else {
        // 如果图标不存在则说明图标还没加载出来，等到页面全部加载再尝试切换
        // eslint-disable-next-line no-undef
        waitElementLoaded(colorToggleIconName, function () {
          var iconElement = document.getElementById(colorToggleIconName);
          if (iconElement) {
            iconElement.setAttribute(
              'class',
              'iconfont ' + icon
            );
          }
        });
      }
    }
  }

  // 当页面加载时，将显示模式设置为 localStorage 中自定义的值（如果有的话）
  applyCustomColorSchemaSettings();

  var oldLoadCs = window.onload;
  window.onload = function () {
    oldLoadCs && oldLoadCs();
    document.getElementById(colorToggleButtonName).addEventListener('click', () => {
      // 当用户点击「开关」时，获得新的显示模式、写入 localStorage、并在页面上生效
      applyCustomColorSchemaSettings(toggleCustomColorSchema());
    });
  };
})(window, document);
