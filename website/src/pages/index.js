import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useComponentSize from "@rehooks/component-size";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Spreadsheet, { createEmptyMatrix } from "react-spreadsheet";
import styles from "./styles.module.css";

const features = [
  {
    title: "Simple",
    description: (
      <>
        Straightforward API focusing on common use cases while keeping
        flexibility
      </>
    ),
  },
  {
    title: "Performant",
    description: (
      <>
        Draw and update tables with many columns and rows without virtualization
      </>
    ),
  },
  {
    title: "Just Components™",
    description: (
      <>
        The Spreadsheet is just a component, compose it easily with other
        components and data
      </>
    ),
  },
];

function Feature({ title, description }) {
  return (
    <div className={clsx("col col--4", styles.feature)}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  const [spreadsheetData, setSpreadsheetData] = React.useState(
    createEmptyMatrix(4, 5)
  );
  const spreadsheetRef = React.useRef(null);
  const spreadsheetSize = useComponentSize(spreadsheetRef);
  const columns = Math.floor(spreadsheetSize.width / 120);
  React.useEffect(() => {
    if (columns) {
      const nextSpreadsheetData = spreadsheetData.map((row) => {
        const nextRow = [...row];
        nextRow.length = columns;
        return nextRow;
      });
      setSpreadsheetData(nextSpreadsheetData);
    }
  }, [columns]);

  return (
    <Layout
      title={siteConfig.title}
      description="Simple, customizable yet performant spreadsheet for React"
    >
      <header className={clsx("hero hero--primary", styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                "button button--outline button--secondary button--lg",
                styles.getStarted
              )}
              to={useBaseUrl("docs/")}
            >
              Get Started
            </Link>
          </div>
          <div ref={spreadsheetRef} className={styles.spreadsheetContainer}>
            <Spreadsheet data={spreadsheetData} onChange={setSpreadsheetData} />
          </div>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map(({ title, imageUrl, description }) => (
                  <Feature
                    key={title}
                    title={title}
                    imageUrl={imageUrl}
                    description={description}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}
