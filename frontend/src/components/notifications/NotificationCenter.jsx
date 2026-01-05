import { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Divider,
  Button
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle,
  Delete,
  WaterDrop,
  Grass,
  Science,
  Info
} from '@mui/icons-material';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    deleteNotification
  } = useNotifications();

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      markRead([notification.id]);
    }

    // Navigate if deep link exists
    if (notification.data?.deep_link) {
      window.location.href = notification.data.deep_link;
    }

    handleClose();
  };

  const handleMarkAllRead = () => {
    markAllRead();
  };

  const handleDelete = (e, notificationId) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'WATERING':
        return <WaterDrop color="primary" />;
      case 'FEEDING':
        return <Grass color="success" />;
      case 'DIAGNOSIS':
        return <Science color="warning" />;
      default:
        return <Info color="info" />;
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label={`${unreadCount} unread notifications`}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<CheckCircle />}
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
          )}
        </Box>

        <Divider />

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                backgroundColor: notification.read ? 'transparent' : 'action.hover',
                borderLeft: notification.read ? 'none' : '4px solid',
                borderLeftColor: 'primary.main',
                py: 1.5,
              }}
            >
              <ListItemIcon>
                {getIcon(notification.notification_type)}
              </ListItemIcon>

              <ListItemText
                primary={notification.title}
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </Typography>
                  </>
                }
              />

              <IconButton
                size="small"
                onClick={(e) => handleDelete(e, notification.id)}
                sx={{ ml: 1 }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </MenuItem>
          ))
        )}

        {notifications.length > 10 && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button size="small" fullWidth>
                View all notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationCenter;
