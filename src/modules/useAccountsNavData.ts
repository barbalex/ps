import { useAtom } from "jotai";
import { useLiveQuery } from "@electric-sql/pglite-react";
import { useLocation } from "@tanstack/react-router";
import { isEqual } from "es-toolkit";

import { filterStringFromFilter } from "./filterStringFromFilter.ts";
import { buildNavLabel } from "./buildNavLabel.ts";
import { accountsFilterAtom, treeOpenNodesAtom } from "../store.ts";

const parentArray = ["data"];
const parentUrl = `/${parentArray.join("/")}`;
const ownArray = [...parentArray, "accounts"];
const ownUrl = `/${ownArray.join("/")}`;

type NavData = {
  id: string;
  label: string;
  count_unfiltered: number;
  count_filtered: number;
}[];

export const useAccountsNavData = () => {
  const [openNodes] = useAtom(treeOpenNodesAtom);
  const [filter] = useAtom(accountsFilterAtom);
  const location = useLocation();

  const filterString = filterStringFromFilter(filter);
  const isFiltered = !!filterString;

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray));

  const sql = isOpen
    ? `
      WITH
        count_unfiltered AS (SELECT count(*) FROM accounts),
        count_filtered AS (SELECT count(*) FROM accounts ${isFiltered ? ` WHERE ${filterString}` : ""})
      SELECT
        account_id as id,
        label,
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM accounts, count_unfiltered, count_filtered
      ${isFiltered ? ` WHERE ${filterString}` : ""}
      ORDER BY label
    `
    : `
      WITH
        count_unfiltered AS (SELECT count(*) FROM accounts),
        count_filtered AS (SELECT count(*) FROM accounts ${isFiltered ? ` WHERE ${filterString}` : ""})
      SELECT
        count_unfiltered.count AS count_unfiltered,
        count_filtered.count AS count_filtered
      FROM count_unfiltered, count_filtered
    `;
  const res = useLiveQuery(sql);
  const loading = res === undefined;

  const navs: NavData = res?.rows ?? [];
  const countUnfiltered = navs[0]?.count_unfiltered ?? 0;
  const countFiltered = navs[0]?.count_filtered ?? 0;
  const urlPath = location.pathname.split("/").filter((p) => p !== "");

  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part);
  const isActive = isEqual(urlPath, ownArray);

  const navData = {
    isInActiveNodeArray,
    isActive,
    isOpen,
    level: 1,
    parentUrl,
    ownArray,
    ownUrl,
    urlPath,
    label: buildNavLabel({
      countFiltered,
      countUnfiltered,
      namePlural: "Accounts",
      loading,
      isFiltered,
    }),
    nameSingular: "Account",
    navs,
  };

  return { loading, navData, isFiltered };
};
