import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";

export default function HomePage() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
  });

  useEffect(() => {
    const appRoot = document.getElementById("__next");
    if (showCompose) {
      appRoot.setAttribute("inert", "true");
    } else {
      appRoot.removeAttribute("inert");
    }
  }, [showCompose]);

  const fetchEmails = async (search = "") => {
    try {
      const res = await axios.get("http://localhost:3001/emails", {
        params: { search },
      });
      setEmails(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      fetchEmails(value);
    }, 500);
    setTypingTimeout(timeout);
  };

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.to) tempErrors.to = "Recipient is required.";
    if (!formData.subject) tempErrors.subject = "Subject is required.";
    if (!formData.body) tempErrors.body = "Email body is required.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmitEmail = async () => {
    if (!validateForm()) return;

    try {
      await axios.post("http://localhost:3001/emails", formData);
      setFormData({ to: "", cc: "", bcc: "", subject: "", body: "" });
      setShowCompose(false);
      await fetchEmails();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Box
        sx={{
          width: 300,
          borderRight: "1px solid #ccc",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            label="Search emails..."
            variant="outlined"
            value={searchText}
            onChange={handleSearchChange}
          />
        </Box>
        <Divider />
        <List sx={{ flexGrow: 1, overflow: "auto" }}>
          {emails.map((email) => (
            <ListItem
              button
              key={email.id}
              onClick={() => handleSelectEmail(email)}
              sx={{
                borderBottom: "1px solid #eee",
                "&:hover": { backgroundColor: "#f5f5f5" },
              }}
            >
              <ListItemText primary={email.subject} secondary={email.to} />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ flex: 1, p: 3 }}>
        {selectedEmail ? (
          <>
            <Typography variant="h5" gutterBottom>
              {selectedEmail.subject}
            </Typography>
            <Typography variant="subtitle1">
              <strong>To:</strong> {selectedEmail.to}
            </Typography>
            {selectedEmail.cc && (
              <Typography variant="subtitle1">
                <strong>CC:</strong> {selectedEmail.cc}
              </Typography>
            )}
            {selectedEmail.bcc && (
              <Typography variant="subtitle1">
                <strong>BCC:</strong> {selectedEmail.bcc}
              </Typography>
            )}
            <Typography variant="body1" sx={{ mt: 2 }}>
              {selectedEmail.body}
            </Typography>
          </>
        ) : (
          <Typography variant="h6">Select an email...</Typography>
        )}
      </Box>
      <Button
        variant="contained"
        color="primary"
        sx={{ position: "fixed", bottom: 20, right: 20 }}
        onClick={() => setShowCompose(true)}
      >
        Compose
      </Button>
      <Dialog
        open={showCompose}
        onClose={() => setShowCompose(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>New Email</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="To"
            variant="outlined"
            margin="normal"
            value={formData.to}
            onChange={(e) => setFormData({ ...formData, to: e.target.value })}
            error={!!errors.to}
            helperText={errors.to}
          />
          <TextField
            fullWidth
            label="CC"
            variant="outlined"
            margin="normal"
            value={formData.cc}
            onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
          />
          <TextField
            fullWidth
            label="BCC"
            variant="outlined"
            margin="normal"
            value={formData.bcc}
            onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
          />
          <TextField
            fullWidth
            label="Subject"
            variant="outlined"
            margin="normal"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            error={!!errors.subject}
            helperText={errors.subject}
          />
          <TextField
            fullWidth
            label="Body"
            variant="outlined"
            margin="normal"
            multiline
            rows={4}
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            error={!!errors.body}
            helperText={errors.body}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCompose(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmitEmail} color="primary">
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
