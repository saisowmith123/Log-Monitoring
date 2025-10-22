// src/pages/Errors/RecentErrorsPaginated.tsx
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Divider,
  Box,
  CircularProgress,
  Alert as MuiAlert,
} from "@mui/material";
import SeverityChip from "../../components/SeverityChip";
import { useRecentErrors } from "../../features/logs/hooks/useRecentErrors";
import { RecentErrorsPayload } from "../../service/logs.errors";

type Props = {
  payload: RecentErrorsPayload; // { from, to, serviceName?, level?, env? }
  initialRowsPerPage?: number;
};

export function RecentErrorsPaginated({
  payload,
  initialRowsPerPage = 10,
}: Props) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(initialRowsPerPage);

  const { items, total, loading, error } = useRecentErrors(
    payload,
    page,
    rowsPerPage
  );

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0); // reset to first page on size change
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Errors
        </Typography>

        {loading ? (
          <Box sx={{ height: 240, display: "grid", placeItems: "center" }}>
            <CircularProgress size={28} />
          </Box>
        ) : error ? (
          <MuiAlert severity="error">{error}</MuiAlert>
        ) : items.length === 0 ? (
          <MuiAlert severity="info">
            No recent errors for the selected range.
          </MuiAlert>
        ) : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Trace ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {new Date(r.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{r.serviceName}</TableCell>
                    <TableCell>
                      <SeverityChip kind="log" value={r.level} />
                    </TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 640,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={r.message}
                    >
                      {r.message}
                    </TableCell>
                    <TableCell title={r.traceId ?? ""}>
                      {r.traceId ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Divider sx={{ my: 1.5 }} />

            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
