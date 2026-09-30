-- "+" in a signed-URL download name gets double-encoded (buyers would see "%2B").
update public.products
   set download_name = 'Assignment Combo - Covers and Teaching Plan.pdf'
 where slug = 'assignment-combo';
