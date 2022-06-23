import { ConfigProvider as AntdConfigProvider } from "antd";
import { createContext, useState } from "react";

export const fonts = [
  "Segoe UI",
  "Roboto",
  "Helvetica Neue",
  "Arial",
  "Noto Sans",
  "Apple Color Emoji",
  "Segoe UI Emoji",
  "Segoe UI Symbol",
  "Noto Color Emoji",
];

const themeDefault = {
  chatColor: "black",
  chatFont: "Roboto",
  chatFontSize: 14,
};

export const ConfigContext = createContext(themeDefault);

AntdConfigProvider.config({
  themeDefault,
});

export const ConfigProvider = ({ children }) => {
  const [theme, setTheme] = useState(themeDefault);
  const changeTheme = (newThemeItem) => {
    const newTheme = {
      ...theme,
      ...newThemeItem,
    };
    AntdConfigProvider.config({
      theme: newTheme,
    });
    setTheme(newTheme);
  };
  return (
    <ConfigContext.Provider value={{ theme, changeTheme }}>
      <AntdConfigProvider>{children}</AntdConfigProvider>
    </ConfigContext.Provider>
  );
};
