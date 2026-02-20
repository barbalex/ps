import { useLiveQuery } from "@electric-sql/pglite-react";
import { useAtom } from "jotai";
import { useLocation } from "@tanstack/react-router";
import { isEqual } from "es-toolkit";

import { filterStringFromFilter } from "./filterStringFromFilter.ts";
import { buildNavLabel } from "./buildNavLabel.ts";
import { wmsServicesFilterAtom, treeOpenNodesAtom } from "../store.ts";

type Props = {
  projectId: string;
};

type NavDataOpen = {
  id: string;
  label: string;
  count_unfiltered?: number;
  count_filtered?: number;
}[];

type NavDataClosed = {
  count_unfiltered: number;
  count_filtered: number;
}[];

export const useWmsServicesNavData = ({ projectId }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom);
  const [filter] = useAtom(wmsServicesFilterAtom);
  const location = useLocation();

  const parentArray = ["data", "projects", projectId];
  const ownArray = [...parentArray, "wms-services"];
  const isOpen = openNodes.some((array) => isEqual(array, ownArray));
  const filterString = filterStringFromFilter(filter);
  const isFiltered = !!filterString;

  const sql = isOpen
    ? `
      WITH
        count_unfiltered AS (SELECT count(*) FROM wms_services WHERE project_id = '${projectId}'),
        count_filtered AS (SELECT count(*) FROM wms_services WHERE project_id = '${projectId}' ${isFiltered ? ` AND ${filterString}` : ""})
      SELECT
        wms_service_id AS id,
        coalesce(url, wms_service_id::text) AS label,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM wms_services, count_unfiltered, count_filtered
      WHERE
        project_id = '${projectId}'
        ${isFiltered ? `AND ${filterString}` : ""}
      ORDER BY url, wms_service_id
    `
    : `
      WITH
        count_unfiltered AS (SELECT count(*) FROM wms_services WHERE project_id = '${projectId}'),
        count_filtered AS (SELECT count(*) FROM wms_services WHERE project_id = '${projectId}' ${isFiltered ? ` AND ${filterString}` : ""})
      SELECT
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM count_unfiltered, count_filtered
    `;
  const res = useLiveQuery(sql);

  const loading = res === undefined;

  const navs: NavDataOpen | NavDataClosed = res?.rows ?? [];
  const countUnfiltered = navs[0]?.count_unfiltered ?? 0;
  const countFiltered = navs[0]?.count_filtered ?? 0;

  const parentUrl = `/${parentArray.join("/")}`;
  const ownUrl = `/${ownArray.join("/")}`;
  const urlPath = location.pathname.split("/").filter((p) => p !== "");
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part);
  const isActive = isEqual(urlPath, ownArray);

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    parentUrl,
    ownArray,
    urlPath,
    ownUrl,
    label: buildNavLabel({
      loading,
      isFiltered,
      countFiltered,
      countUnfiltered,
      namePlural: "WMS Services",
    }),
    nameSingular: "WMS Service",
    navs,
  };

  return { loading, navData, isFiltered };
};
