import React from "react";
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import FilterListIcon from '@material-ui/icons/FilterList';


const ITEM_HEIGHT = 48;

interface Props {
  value: number
  onChange: (index: number) => void
  options: Array<string>
}

function FilterMenut(props: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuItemClick = (_event: React.MouseEvent<HTMLElement>, index: number) => {
    props.onChange(index);
    handleClose();
  };

  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  return (
    <React.Fragment>
      <IconButton
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={handleClickListItem}
      >
        <FilterListIcon />
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: '20ch',
          },
        }}
      >
        {props.options.map((option: string, index: number) => (
          <MenuItem key={option} selected={index === props.value} onClick={(event) => handleMenuItemClick(event, index)}>
            {option}
          </MenuItem>
        ))}
      </Menu>
    </React.Fragment>
  )
}

export default FilterMenut;
