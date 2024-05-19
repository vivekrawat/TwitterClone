/**
 * filterInput - direct copy from fron-end with Dompurify removed
 * @returns input if good
 * @throws {Error} with user-friendly message'}
 * @param {String} input - input to sanitize
 * @param type - one of 'name', 'username', 'password', 'html', 'custom'
 * @param {Object} opts optional setings with sig { min_length, max_length, regex }
 */
function filterInput(
  input = "",
  type = "custom",
  {
    min_length: min = 1,
    max_length: max = 70,
    regex: reg = null,
    identifier = null,
  } = {}
) {
  identifier = identifier || `input {${type}}`;
  input = input.toString().trim();
  let regexes = {
    username: RegExp(`^[_a-zA-Z0-9]{${min},${max}}$`),
    password: RegExp(`^\\S{${min},${max}}$`),
    name: RegExp(`^.{${min},${max}}$`),
  };
  if (!reg) {
    reg = regexes[type];
  }
  if (reg) {
    if (!reg.test(input)) {
      throw Error(
        `${identifier} must match regex: ${reg} (range between ${min} and ${max} characters)`
      );
    }
  }
  //else custom || html
  // if (type === 'html')
  //     input = DOMPurify.sanitize(input, { ALLOWED_TAGS: ['b'] }).trim()
  if (input.length > max || input.length < min) {
    throw Error(
      `${identifier} must be minimum ${min} and maximum ${max} characters`
    );
  }
  if (input.includes("\n"))
    // long text, strip of multiple newlines etc
    input = input.replace(/\n+/g, "\n").trim();
  return input;
}

exports.filterInput = filterInput