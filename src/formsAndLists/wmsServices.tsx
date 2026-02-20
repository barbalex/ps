import { useParams, useNavigate } from "@tanstack/react-router";

import { createWmsService } from "../modules/createRows.ts";
import { ListHeader } from "../components/ListHeader.tsx";
import { Row } from "../components/shared/Row.tsx";
import { FilterButton } from "../components/shared/FilterButton.tsx";
import { Loading } from "../components/shared/Loading.tsx";
import { useWmsServicesNavData } from "../modules/useWmsServicesNavData.ts";
import "../form.css";

const from = "/data/projects/$projectId_/wms-services/";

export const WmsServices = () => {
  const { projectId } = useParams({ from });
  const navigate = useNavigate();

  const { loading, navData, isFiltered } = useWmsServicesNavData({ projectId });
  const { navs, label } = navData;

  const add = async () => {
    const id = await createWmsService({ projectId });
    if (!id) return;
    navigate({
      to: `${id}/wms-service`,
      params: (prev) => ({ ...prev, wmsServiceId: id }),
    });
  };

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular="WMS Service"
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map(({ id, label }) => (
            <Row key={id} to={id} label={label ?? id} />
          ))
        )}
      </div>
    </div>
  );
};
