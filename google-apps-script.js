var NOTIFICATION_EMAIL = "kiddo.boutique0@gmail.com";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    var customerName = data.name || data.customer_name || 'عميل';
    var phone = data.phone || '';
    var address = data.address || '';
    var rawPayment = data.payment || data.payment_method || 'الدفع عند الاستلام';
    var payment = rawPayment;
    if (rawPayment === 'cod') {
      payment = 'الدفع عند الاستلام';
    } else if (rawPayment === 'instapay') {
      payment = 'إنستاباي (InstaPay)';
    } else if (rawPayment === 'paymob') {
      payment = 'بطاقة بنكية (Paymob)';
    }

    var total = data.total || 0;
    var items = data.items || [];
    var dateStr = Utilities.formatDate(new Date(), "GMT+3", "yyyy-MM-dd HH:mm:ss");

    var itemsSummary = '';
    var itemsHtmlTable = '';
    if (Array.isArray(items)) {
      itemsSummary = items.map(function(it) {
        return (it.quantity || 1) + 'x ' + (it.title || '') + ' (تفاصيل: ' + (it.size || 'عادي') + ') - ' + (it.price || 0) + ' ج.م';
      }).join('\n');

      itemsHtmlTable = items.map(function(it) {
        return '<tr style="border-bottom: 1px solid #eee;">' +
                 '<td style="padding: 8px 10px;">' + (it.title || '') + '</td>' +
                 '<td style="padding: 8px 10px; text-align: center;">' + (it.size || 'عادي') + '</td>' +
                 '<td style="padding: 8px 10px; text-align: center;">' + (it.quantity || 1) + '</td>' +
                 '<td style="padding: 8px 10px; text-align: left; font-weight: bold;">' + ((it.price || 0) * (it.quantity || 1)) + ' ج.م</td>' +
               '</tr>';
      }).join('');
    } else {
      itemsSummary = String(items);
      itemsHtmlTable = '<tr><td colspan="4" style="padding:10px;">' + itemsSummary + '</td></tr>';
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Orders') || ss.getActiveSheet();
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['التاريخ', 'اسم العميل', 'رقم الهاتف', 'العنوان / الموقع', 'طريقة الدفع', 'المنتجات', 'الإجمالي', 'الحالة']);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#f0eeeb');
    }

    sheet.appendRow([
      dateStr,
      customerName,
      "'" + phone,
      address,
      payment,
      itemsSummary,
      total,
      'Pending'
    ]);

    var emailSubject = '🛍️ طلب جديد من ' + customerName + ' بمبلغ ' + total + ' ج.م';
    var emailHtml = 
      '<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">' +
        '<div style="background-color: #7E7AE0; color: white; padding: 18px; border-radius: 8px; text-align: center; margin-bottom: 20px;">' +
          '<h2 style="margin: 0; font-size: 22px;">🛍️ طلب جديد في متجر Kiddo Boutique</h2>' +
        '</div>' +

        '<div style="background-color: #faf8f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #eee;">' +
          '<h3 style="margin-top: 0; color: #2c2c2c; border-bottom: 2px solid #7E7AE0; padding-bottom: 8px;">بيانات العميل:</h3>' +
          '<p style="margin: 6px 0;"><strong>اسم العميل:</strong> ' + customerName + '</p>' +
          '<p style="margin: 6px 0;"><strong>رقم الهاتف:</strong> <a href="tel:' + phone + '" dir="ltr">' + phone + '</a> | <a href="https://wa.me/2' + phone.replace(/^0+/, '') + '" target="_blank" style="color: #25D366; font-weight: bold;">واتساب</a></p>' +
          '<p style="margin: 6px 0;"><strong>طريقة الدفع:</strong> ' + payment + '</p>' +
          '<p style="margin: 6px 0;"><strong>موقع التوصيل:</strong> <a href="' + address + '" target="_blank" style="color: #7E7AE0; font-weight: bold;">فتح الموقع على خرائط جوجل</a></p>' +
        '</div>' +

        '<div style="margin-bottom: 20px;">' +
          '<h3 style="color: #2c2c2c; border-bottom: 2px solid #7E7AE0; padding-bottom: 8px;">تفاصيل المنتجات:</h3>' +
          '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">' +
            '<thead>' +
              '<tr style="background-color: #f0eeeb;">' +
                '<th style="padding: 8px 10px; text-align: right;">المنتج</th>' +
                '<th style="padding: 8px 10px; text-align: center;">التفاصيل</th>' +
                '<th style="padding: 8px 10px; text-align: center;">الكمية</th>' +
                '<th style="padding: 8px 10px; text-align: left;">السعر</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              itemsHtmlTable +
            '</tbody>' +
          '</table>' +
        '</div>' +

        '<div style="background-color: #eef2ff; padding: 14px 18px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">' +
          '<span style="font-size: 18px; font-weight: bold; color: #2c2c2c;">الإجمالي الكلي:</span>' +
          '<span style="font-size: 22px; font-weight: bold; color: #7E7AE0;">' + total + ' ج.م</span>' +
        '</div>' +

        '<p style="color: #888; font-size: 12px; text-align: center; margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px;">تم إرسال هذا الإشعار تلقائياً من متجرك الإلكتروني.</p>' +
      '</div>';

    if (NOTIFICATION_EMAIL) {
      MailApp.sendEmail({
        to: NOTIFICATION_EMAIL,
        subject: emailSubject,
        htmlBody: emailHtml
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Order processed successfully' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'active', service: 'Kiddo Boutique Email & Sheet API' }))
    .setMimeType(ContentService.MimeType.JSON);
}
