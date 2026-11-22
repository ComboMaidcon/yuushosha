// Giá dự kiến V3 của PRECHECK (đơn vị VND), không phải cổng thanh toán.
(function(){
 const stages = [
  {label:'Giai đoạn đầu · áp dụng trong demo',single:199000,sme:499000,quota:3},
  {label:'Mốc giảm giá 1 · chưa áp dụng',single:169000,sme:449000,quota:3},
  {label:'Mốc giảm giá 2 · chưa áp dụng',single:149000,sme:399000,quota:3},
 ];
 window.PC_PRICING={stages,active:stages[0],format:v=>Math.round(v).toLocaleString('vi-VN')+'đ',month:d=>new Date(d||Date.now()).toISOString().slice(0,7)};
})();
