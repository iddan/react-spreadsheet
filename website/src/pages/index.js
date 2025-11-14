import * as React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Spreadsheet, { createEmptyMatrix } from "react-spreadsheet";
import CodeBlock from "@theme/CodeBlock";
import styles from "./styles.module.css";

function TabbedCodeBlock({ tabs }) {
  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <div className={styles.tabbedCodeBlock}>
      <div className={styles.codeTabs}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={clsx(
              styles.codeTab,
              activeTab === index && styles.codeTabActive
            )}
            onClick={() => setActiveTab(index)}
          >
            {tab.filename}
          </button>
        ))}
      </div>
      <CodeBlock language="tsx">{tabs[activeTab].code}</CodeBlock>
    </div>
  );
}

function FeatureSection({ title, description, code, demo, variant, codeTabs }) {
  return (
    <section className={clsx(styles.featureSection, styles[variant])}>
      <div className="container">
        <div className={styles.featureHeader}>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className={styles.featureContent}>
          <div className={styles.featureCode}>
            {codeTabs ? (
              <TabbedCodeBlock tabs={codeTabs} />
            ) : (
              code && <CodeBlock language="tsx">{code}</CodeBlock>
            )}
          </div>
          <div className={styles.featureDemo}>{demo}</div>
        </div>
      </div>
    </section>
  );
}

// Custom DataViewer that displays stars for ratings
function RatingViewer({ cell }) {
  const value = Number(cell?.value) || 0;
  const stars = "★".repeat(value) + "☆".repeat(5 - value);
  return (
    <span className={styles.ratingViewer}>
      {stars} ({value})
    </span>
  );
}

// Custom DataEditor with range input (1-5)
function RatingEditor({ cell, onChange, exitEditMode }) {
  const value = Number(cell?.value) || 1;
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    onChange({ ...cell, value: newValue });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Escape") {
      exitEditMode();
    }
  };

  return (
    <div className={styles.ratingEditor}>
      <input
        ref={inputRef}
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={styles.ratingSlider}
      />
      <span className={styles.ratingValue}>{value}</span>
    </div>
  );
}

function Simple({ data, onChange }) {
  return <Spreadsheet data={data} onChange={onChange} />;
}

function JustComponents({ data, onChange }) {
  return (
    <Spreadsheet
      data={data}
      onChange={onChange}
      DataViewer={RatingViewer}
      DataEditor={RatingEditor}
    />
  );
}

export default function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  // Hero spreadsheet
  const [heroData, setHeroData] = React.useState(createEmptyMatrix(4, 5));

  // Simple feature - basic usage
  const [simpleData, setSimpleData] = React.useState([
    [{ value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }],
  ]);

  // Performant feature - larger data
  const [performantData, setPerformantData] = React.useState(
    createEmptyMatrix(20, 10)
  );

  // Just Components feature - with rating data
  const [componentsData, setComponentsData] = React.useState([
    [{ value: "Feature" }, { value: "Rating" }],
    [{ value: "Performance" }, { value: 5 }],
    [{ value: "Ease of Use" }, { value: 4 }],
    [{ value: "Documentation" }, { value: 5 }],
  ]);

  return (
    <Layout
      title={siteConfig.title}
      description="Simple, customizable yet performant spreadsheet for React"
    >
      <header className={clsx("hero hero--primary", styles.heroBanner)}>
        <div className="container">
          <img
            src={useBaseUrl("img/logo.svg")}
            alt="React Spreadsheet Logo"
            className={styles.heroLogo}
          />
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                "button button--primary button--lg",
                styles.heroButton
              )}
              to={useBaseUrl("learn/")}
            >
              Get Started
            </Link>
            <a
              className={clsx(
                "button button--outline button--primary button--lg",
                styles.heroButton
              )}
              href={useBaseUrl("storybook/")}
            >
              Storybook
            </a>
          </div>
          <div className={styles.heroSpreadsheet}>
            <Spreadsheet data={heroData} onChange={setHeroData} />
          </div>
        </div>
      </header>
      <main>
        <FeatureSection
          title="Simple"
          description="Straightforward API focusing on common use cases while keeping flexibility. Just import the component, pass your data, and you're ready to go."
          variant="dark"
          code={`import Spreadsheet from "react-spreadsheet";

function Simple() {
  const [data, setData] = useState([
    [{ value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }],
  ]);
  
  return (
    <Spreadsheet 
      data={data} 
      onChange={setData} 
    />
  );
}`}
          demo={
            <div className={styles.demoContainer}>
              <Simple data={simpleData} onChange={setSimpleData} />
            </div>
          }
        />
        <FeatureSection
          title="Performant"
          description="Draw and update tables with many columns and rows without virtualization. Handles large datasets efficiently with minimal re-renders."
          variant="light"
          code={`import Spreadsheet from "react-spreadsheet";

function Performant() {
  const [data, setData] = useState(
    createEmptyMatrix(20, 10)
  );
  
  return (
    <Spreadsheet 
      data={data} 
      onChange={setData} 
    />
  );
}`}
          demo={
            <div className={styles.demoContainer}>
              <Spreadsheet data={performantData} onChange={setPerformantData} />
            </div>
          }
        />
        <FeatureSection
          title="Just Components™"
          description="The Spreadsheet is just a component, compose it easily with other components and data. Use custom DataViewer and DataEditor components to create specialized cell types."
          variant="dark"
          codeTabs={[
            {
              filename: "JustComponents.tsx",
              code: `import Spreadsheet from "react-spreadsheet";
import { RatingViewer } from "./RatingViewer";
import { RatingEditor } from "./RatingEditor";

function JustComponents({ data, onChange }) {
  return (
    <Spreadsheet
      data={data}
      onChange={onChange}
      DataViewer={RatingViewer}
      DataEditor={RatingEditor}
    />
  );
}`,
            },
            {
              filename: "RatingViewer.tsx",
              code: `function RatingViewer({ cell }) {
  const value = Number(cell?.value) || 0;
  const stars = "★".repeat(value) + "☆".repeat(5 - value);
  return <span>{stars} ({value})</span>;
}`,
            },
            {
              filename: "RatingEditor.tsx",
              code: `function RatingEditor({ cell, onChange, exitEditMode }) {
  const value = Number(cell?.value) || 1;
  
  return (
    <div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => 
          onChange({ ...cell, value: Number(e.target.value) })
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") exitEditMode();
        }}
      />
      <span>{value}</span>
    </div>
  );
}`,
            },
          ]}
          demo={
            <div className={styles.demoContainer}>
              <JustComponents
                data={componentsData}
                onChange={setComponentsData}
              />
            </div>
          }
        />
      </main>
    </Layout>
  );
}
