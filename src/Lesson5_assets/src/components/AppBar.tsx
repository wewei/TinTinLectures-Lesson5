import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { ALL_CANISTER_IDS } from "../AppMeta";

export type MicroblogAppBarProps = {
  logout: () => void;
  canisterId: string;
  setCanisterId: (canisterId: string) => void;
};

export default function MicroblogAppBar({
  logout,
  canisterId,
  setCanisterId,
}: MicroblogAppBarProps): JSX.Element {
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Select
          value={canisterId}
          onChange={(e) => setCanisterId(e.target.value)}
        >
          {ALL_CANISTER_IDS.map((cid) => (
            <MenuItem key={cid} value={cid}>
              {cid}
            </MenuItem>
          ))}
        </Select>
      </Toolbar>
    </AppBar>
  );
}
