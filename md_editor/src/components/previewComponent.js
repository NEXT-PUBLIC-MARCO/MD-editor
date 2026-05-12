import React from 'react'

function PreviewComponent({ htmlContent }) {
  return (
    <div className="preview" dangerouslySetInnerHTML={{ __html: htmlContent }} />
  )
}

export default PreviewComponent