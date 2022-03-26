import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { ALL_CANISTER_IDS } from "../AppMeta";
import { Button, Grid } from "@mui/material";

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
        <Grid container>
          <Grid item xs={10}>
            Switch Account: &nbsp;
            <Select
              value={canisterId}
              onChange={(e) => setCanisterId(e.target.value)}
              variant="standard"
              sx={{ color: "White" }}
            >
              {ALL_CANISTER_IDS.map((cid) => (
                <MenuItem key={cid} value={cid}>
                  {cid}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={2}>
            <Button onClick={logout} sx={{ color: "White", float: "right" }}>
              Logout
            </Button>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}
