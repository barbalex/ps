import './home.css'

const Home = () => (
  <div className="outer-container">
    <picture>
      <source
        srcSet="home_700.avif 700w, home_1000.avif 1000w, home_1400.avif 1400w, home_2000.avif 2000w, home_2500.avif 2500w"
        type="image/avif"
      />
      <img
        src="home_700.webp"
        srcSet="home_700.webp 700w, home_1000.webp 1000w, home_1400.webp 1400w, home_2000.webp 2000w, home_2500.webp 2500w"
        sizes="100vw"
        alt="Spinnen-Ragwurz"
        className="img"
      />
    </picture>
    <div className="scroll-container">
      <h6 className="page-title">Bedrohte Pflanzenarten fördern</h6>
      <div className="card-container">
        <div className="card">
          <h3 className="card-title">Arten</h3>
          Sehr seltene und gefährdete Pflanzenarten, für welche der Kanton
          Zürich eine besondere Verantwortung hat. Für jede wurde ein
          Aktionsplan erstellt.
        </div>
        <div className="card">
          <h3 className="card-title">Artverantwortliche</h3>
          Für jede Aktionsplanart ist ein Experte oder eine Expertin
          verantwortlich.
        </div>
        <div className="card">
          <h3 className="card-title">Populationen</h3>
          Die Pflanzen einer Art bilden kleine oder grosse Populationen, je
          nachdem wie günstig die Bedingungen sind.
        </div>
        <div className="card">
          <h3 className="card-title">Ziele</h3>
          beschreiben, wie sich die Populationen künftig entwickeln sollen,
          damit die Art langfristig erhalten bleibt.
        </div>
        <div className="card">
          <h3 className="card-title">Massnahmen</h3>
          Primär werden die Lebensräume der ursprünglichen Vorkommen der
          Aktionsplanarten gemäss ihrer Ansprüche aufgewertet. Sekundär werden
          Aktionsplanarten vermehrt, um bestehende Populationen durch
          Ansiedlungen zu verstärken oder um neue Populationen zu gründen.
        </div>
        <div className="card">
          <h3 className="card-title">Kontrollen</h3>
          Artverantwortliche und Freiwillige besuchen Populationen, erfassen die
          Grösse des Bestandes und überprüfen die Wirkung der Massnahmen.
        </div>
        <div className="card">
          <h3 className="card-title">Berichte</h3>
          Jährlich verfassen die Artverantwortlichen einen Bericht über die
          Entwicklung der Populationen, den Erfolg der Massnahmen und die
          Erreichung der Ziele.
        </div>
        <div className="card">
          <h3 className="card-title">Beobachtungen</h3>
          Die Artverantwortlichen prüfen von Dritten gemeldete Beobachtungen und
          ordnen diese den Populationen der Aktionsplanarten zu.
        </div>
      </div>
    </div>
  </div>
)

export const Component = Home
