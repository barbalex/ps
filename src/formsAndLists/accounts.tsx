import { useNavigate } from "@tanstack/react-router";

import { createAccount } from "../modules/createRows.ts";
import { ListHeader } from "../components/ListHeader.tsx";
import { Row } from "../components/shared/Row.tsx";
import { FilterButton } from "../components/shared/FilterButton.tsx";
import { Loading } from "../components/shared/Loading.tsx";
import { useAccountsNavData } from "../modules/useAccountsNavData.ts";
import "../form.css";

const from = "/data/accounts";

export const Accounts = () => {
  const navigate = useNavigate({ from });

  const { loading, navData, isFiltered } = useAccountsNavData();
  const { navs, label, nameSingular } = navData;

  const add = async () => {
    const id = await createAccount();
    if (!id) return;
    navigate({ to: id });
  };

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map(({ id, label }) => (
            <Row key={id} label={label ?? id} to={`/data/accounts/${id}`} />
          ))
        )}
      </div>
    </div>
  );
};
