import { useParams, useNavigate } from "@tanstack/react-router";

import { createPlaceUser } from "../modules/createRows.ts";
import { usePlaceUsersNavData } from "../modules/usePlaceUsersNavData.ts";
import { ListHeader } from "../components/ListHeader.tsx";
import { FilterButton } from "../components/shared/FilterButton.tsx";
import { Row } from "../components/shared/Row.tsx";
import { Loading } from "../components/shared/Loading.tsx";
import "../form.css";

export const PlaceUsers = ({ from }) => {
  const { projectId, subprojectId, placeId, placeId2 } = useParams({ from });
  const navigate = useNavigate();

  const { loading, navData, isFiltered } = usePlaceUsersNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
  });
  const { navs, label, nameSingular } = navData;

  const add = async () => {
    const id = await createPlaceUser({ placeId: placeId2 ?? placeId });
    if (!id) return;
    navigate({
      to: id,
      params: (prev) => ({ ...prev, placeUserId: id }),
    });
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
            <Row key={id} to={id} label={label ?? id} />
          ))
        )}
      </div>
    </div>
  );
};
