import { SketchPicker } from "react-color";
import { useContext } from "react";
import { InputNumber, Select, Slider } from "antd";
import { ConfigContext, fonts } from "../routing/ConfigProvider";
import { map } from "lodash";

export const ColorPicker = () => {
  const { theme, changeTheme } = useContext(ConfigContext);
  const { chatColor, chatFont, chatFontSize } = theme;
  const changeVariable = (key, value, prefix = "") => {
    document.documentElement.style.setProperty(`--${key}`, `${value}${prefix}`);
    changeTheme({
      [key]: value,
    });
  };
  console.log(chatFontSize);
  return (
    <>
      <SketchPicker
        color={chatColor}
        onChange={({ hex }) => {
          changeVariable("chatColor", hex);
        }}
      />
      <Select
        value={chatFont}
        onChange={(font) => {
          changeVariable("chatFont", font);
        }}
      >
        {map(fonts, (font, index) => {
          return (
            <Select.Option key={index} value={font}>
              {font}
            </Select.Option>
          );
        })}
      </Select>
      <Slider
        min={8}
        max={24}
        onChange={(size) => changeVariable("chatFontSize", size, "px")}
        value={typeof chatFontSize === "number" ? chatFontSize : 0}
      />
      <InputNumber
        min={8}
        max={24}
        value={chatFontSize}
        onChange={(size) => changeVariable("chatFontSize", size, "px")}
      />
    </>
  );
};
