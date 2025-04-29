import { useTheme } from "../../context/ThemeContext"

const Metrics = () => {
  const { cssThemes } = useTheme();

  return (
    <div
      style={{ color: cssThemes.colors.primaryTextColor }}
      className="w-full h-full flex justify-center items-center"
    >
      <section
        style={{ background: cssThemes.colors.primary }}
        className="border-4 w-[90%] flex flex-col items-center rounded-2xl shadow-xl p-8 gap-8 text-center"
      >
        <div>
          Metrics
        </div>
      </section>
    </div>
  )
}

export default Metrics