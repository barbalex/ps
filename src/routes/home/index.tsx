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
          <h3 className="card-title">Arten / Biotope</h3>
          Seltene und gefährdete Arten oder Biotope, die überwacht und mit
          Massnahmen gefördert werden.
        </div>
        <div className="card">
          <h3 className="card-title">Verantwortliche</h3>
          Für jede Art / jedes Biotop ist ein Experte oder eine Expertin
          verant&shy;wortlich.
        </div>
        <div className="card">
          <h3 className="card-title">Räume</h3>
          Biotope / Populationen, für die Massnahmen und Kontrollen
          durch&shy;geführt werden.
        </div>
        <div className="card">
          <h3 className="card-title">Zweistufige Räume</h3>
          Es kann nützlich sein, Räume in zwei Stufen zu glie&shy;dern.
          Beispiele: Populationen und Teil&shy;populationen, Biotope und deren
          Teilflächen.
        </div>
        <div className="card">
          <h3 className="card-title">Ziele</h3>
          beschreiben, wie sich die Populationen / Biotope künftig entwickeln
          sollen, damit die Art bzw. das Biotop langfristig erhalten bleibt.
        </div>
        <div className="card">
          <h3 className="card-title">Massnahmen</h3>
          Was gemacht wird, um den Zustand der Art / des Biotops an diesem Ort
          zu verbessern.
        </div>
        <div className="card">
          <h3 className="card-title">Kontrollen</h3>
          Die aktuelle Situation wird erfasst (Arten, Populationsgrössen,
          Mass&shy;nahmen-Wirkung).
        </div>
        <div className="card">
          <h3 className="card-title">Berichte</h3>
          Jährlich verfassen die Artverantwortlichen einen Bericht über die
          Entwick&shy;lung der Populationen / Biotope, den Erfolg der Massnahmen
          und die Errei&shy;chung der Ziele.
        </div>
        <div className="card">
          <h3 className="card-title">Beobachtungen</h3>
          Artverantwortliche prüfen von Dritten gemeldete Beobachtungen und
          ordnen diese den Popula&shy;tionen / Biotopen zu.
        </div>
      </div>
    </div>
  </div>
)
