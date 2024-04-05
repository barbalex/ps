import './index.css'

export const Component = () => (
  <div style={{ height: '100%' }}>
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
      <h6 className="page-title">Bedrohte Arten und Biotope fördern</h6>
      <div className="card-container">
        <div className="card">
          <h3 className="card-title">Arten oder Biotope</h3>
          Seltene und gefährdete Arten oder Biotope werden überwacht und
          gefördert.
        </div>
        <div className="card">
          <h3 className="card-title">Ziele</h3>
          beschreiben, wie sich die Populationen und Biotope künftig entwickeln
          sollen.
        </div>
        <div className="card">
          <h3 className="card-title">Verantwortliche</h3>
          organisieren die Überwachung und Förderung.
        </div>
        <div className="card">
          <h3 className="card-title">Räume</h3>
          Einzelne Populationen und Biotope, für die Massnahmen und Kontrollen
          durch&shy;geführt werden.
        </div>
        <div className="card">
          <h3 className="card-title">Zweistufige Räume</h3>
          Sie können Populationen in Teil&shy;populationen, Biotope in
          Teilflächen glie&shy;dern.
        </div>
        <div className="card">
          <h3 className="card-title">Massnahmen</h3>
          Was gemacht wird, um den Zustand einer Art oder eines Biotops zu
          verbessern.
        </div>
        <div className="card">
          <h3 className="card-title">Kontrollen</h3>
          Erfasst wird der aktuelle Zustand und die Wirkung von Massnahmen.
        </div>
        <div className="card">
          <h3 className="card-title">Berichte</h3>
          Die Verantwortlichen berichten über die Entwick&shy;lung der
          Populationen und Biotope, den Erfolg der Massnahmen und die
          Errei&shy;chung der Ziele.
        </div>
        <div className="card">
          <h3 className="card-title">Beobachtungen</h3>
          Verantwortliche prüfen von Dritten gemeldete Beobachtungen und ordnen
          diese den Popula&shy;tionen und Biotopen zu.
        </div>
        <div className="card">
          <h3 className="card-title">Mobilfähig</h3>
          Promoting Species passt sich jeder Bildschirmgrösse an. Arbeiten sie
          effizient auf ihrem Smartphone, Tablet oder Computer.
        </div>
        <div className="card">
          <h3 className="card-title">Bring your own device</h3>
          Promoting Species funktioniert auf jedem Betriebssystem mit modernem
          Browser: Windows, MacOS, Linux, Android, iOS...
        </div>
        <div className="card">
          <h3 className="card-title">Kein Internet? Egal!</h3>
          Promoting Species funktioniert auch offline. Sobald sie wieder online
          sind, werden die Daten synchronisiert.
        </div>
      </div>
    </div>
  </div>
)
