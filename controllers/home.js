/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('home', {
    title: 'Home'
  });
}
exports.postFileUpload = (req, res) => {
	console.log("Uploading file: ", req.body)
  req.flash('success', { msg: 'File was uploaded successfully.' });
  res.redirect('/');
}

